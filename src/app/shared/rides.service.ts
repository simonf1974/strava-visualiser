import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";
import { firestore, FirebaseError } from "firebase";
import { StravaService } from "./strava.service";
import {
  IRide,
  ISegPerformance,
  IRideDetails,
  ISegEffort,
  ISegPerfPreUpdate,
  ISegPerfPreSave,
  ICalls,
  collections
} from "../model/model";
import { Rides } from "../model/ride";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { DatabaseService } from "./database.service";
import { SegmentService } from "./segment.service";

@Injectable({
  providedIn: "root"
})
export class RidesService {
  private _calls: ICalls = {
    numStravaApiCallsMade: 0,
    numStravaApiCallsDone: 0,
    numDbReadsMade: 0,
    numDbReadsDone: 0,
    numDbWritesMade: 0,
    numDbWritesDone: 0,
    httpDetails: "",
    databaseMsg: ""
  };
  calls: BehaviorSubject<any>;
  private rides: Rides = null;

  private batches: Map<number, [firestore.WriteBatch, number]> = new Map<
    number,
    [firestore.WriteBatch, number]
  >();

  constructor(
    private firestore: AngularFirestore,
    private stravaService: StravaService,
    private dbService: NgxIndexedDBService,
    private remoteDbService: DatabaseService,
    private segmentService: SegmentService
  ) {
    this.calls = new BehaviorSubject(this._calls);
    this.initMsgPropogation(this.stravaService);
    this.initMsgPropogation(this.remoteDbService);
    this.initMsgPropogation(this.segmentService);
    dbService.currentStore = "ridecache";
  }

  private initMsgPropogation(service) {
    service.incrementCount.subscribe(call => {
      if (call !== null) this.incrementCount(call);
    });
    service.propagateMsg.subscribe(msg => {
      if (msg !== null) this.propagateMsg(msg.key, msg.error);
    });
  }

  private incrementCount(call: string): void {
    this._calls[call] = ++this._calls[call];
    this.calls.next(this._calls);
  }

  private propagateMsg(key: string, error: string): void {
    this._calls[key] = error;
    this.calls.next(this._calls);
  }

  // Main logic for scraping Strava data and saving to database

  scrapeStravaData(page?: number): void {
    const pageSize = 200;
    const shouldPage = true;
    const maxPages = 100;
    if (page === undefined) page = 1;

    this.stravaService.getRides(pageSize, page).then((rides: number[]) => {
      console.log(`Got ${rides.length} for page ${page}`);
      rides.forEach((rideId: number) => this.processRide(rideId));
      if (shouldPage && rides.length !== 0 && page < maxPages) this.scrapeStravaData(++page);
    });
  }

  private processRide(rideId: number): void {
    this.remoteDbService.getByKey(collections.rides, rideId).then((rideFromDb: IRide) => {
      if (rideFromDb !== null && rideFromDb === undefined) {
        this.stravaService.getRide(rideId).then((rideDetails: IRideDetails) => {
          if (rideDetails !== null) this.saveRideDetails(rideDetails);
          else
            console.log("Ride details are null, I'm guessing there was an error getting the ride");
        });
      }
    });
  }

  private saveRideDetails(rideDetails: IRideDetails): void {
    console.log(
      `About to do a batch for ride ${rideDetails.ride.id} with ${rideDetails.segEfforts.length} segments`
    );
    this.remoteDbService.startBatch(rideDetails.ride.id);

    this.remoteDbService.addDataToBatch(
      collections.rides,
      rideDetails.ride.id,
      rideDetails.ride,
      rideDetails.ride.id
    );

    rideDetails.segEfforts.forEach((segEffort: ISegEffort) => {
      this.remoteDbService.addDataToBatch(
        collections.segmentPerformance,
        [segEffort.segment_id, rideDetails.ride.athlete_id],
        this.mergeSegEffortAndSegPerf(segEffort, rideDetails.ride.athlete_id),

        rideDetails.ride.id
      );
    });

    this.remoteDbService.addDataToBatch(
      "ride_seg_efforts",
      rideDetails.ride.id,
      { seg_efforts: rideDetails.segEfforts },
      rideDetails.ride.id
    );

    this.remoteDbService.endBatch(rideDetails.ride.id);
  }

  // Logic to refesh perf data with leaderboards

  refreshPerformanceData(): void {
    const segmentsToRefresh: number[] = [];

    this.segmentService.getPerformanceDataToRefresh().subscribe(
      (perfData: ISegPerformance[]) => {
        this.incrementCount("numDbReadsDone");
        perfData.forEach((segPerformance: ISegPerformance) => {
          if (
            segPerformance.requires_refresh === true &&
            !segmentsToRefresh.includes(segPerformance.segment_id)
          ) {
            segmentsToRefresh.push(segPerformance.segment_id);

            this.stravaService
              .getLeaderboard(segPerformance.segment_id)
              .then((leaderboard: ISegPerfPreUpdate) => {
                if (leaderboard !== null)
                  this.applyLeaderboardToSegPerformance(segPerformance, leaderboard);
              });
          }
        });
      },
      (error: FirebaseError) => {
        this.propagateMsg(
          "databaseMsg",
          `Database error in get performance data: Code: ${error.code}, Message: ${error.message}`
        );
        console.log(
          `Database error in get performance data: Code: ${error.code}, Message: ${error.message}`
        );
      }
    );
  }

  private applyLeaderboardToSegPerformance(
    segPerformance: ISegPerformance,
    leaderboard: ISegPerfPreUpdate
  ): void {
    this.remoteDbService.updateData(
      collections.segmentPerformance,
      [segPerformance.segment_id, segPerformance.athlete_id],
      leaderboard
    );
  }

  // Database access

  clearLocalDb() {
    this.incrementCount("numDbWritesMade");
    this.dbService.clear().then(res => {
      this.rides = null;
      this.segmentService.clearLocalDb();
      this.incrementCount("numDbWritesDone");
    });
  }

  getRides(): Promise<Rides> {
    if (this.rides !== null) return new Promise(resolve => resolve(this.rides));
    return this.dbService.getByIndex("key", "rides").then(rides => {
      if (rides === undefined) return this.getRidesFromDb();
      else {
        const ridesToReturn: Rides = new Rides(JSON.parse(rides.value)._rides);
        this.rides = ridesToReturn;
        return ridesToReturn;
      }
    });
  }

  private getRidesFromDb(): Promise<Rides> {
    return this.firestore
      .collection("rides", ref => ref.limit(5000))
      .get()
      .toPromise()
      .then(res => {
        console.log("got rides from db");
        const rides = new Rides(res.docs.map(ride => ride.data() as IRide));
        this.dbService.add({ key: "rides", value: JSON.stringify(rides) });
        this.rides = rides;
        return rides;
      });
  }

  //API to database mapping

  private mergeSegEffortAndSegPerf(segEffort: ISegEffort, athleteId: number): ISegPerfPreSave {
    const segPerf: ISegPerfPreSave = {
      requires_refresh: true,
      athlete_id: athleteId,
      segment_id: segEffort.segment_id,
      segment: {
        average_grade: segEffort.segment.average_grade,
        city: segEffort.segment.city,
        climb_category: segEffort.segment.climb_category,
        country: segEffort.segment.country,
        distance: segEffort.segment.distance,
        elevation_high: segEffort.segment.elevation_high,
        elevation_low: segEffort.segment.elevation_low,
        id: segEffort.segment_id,
        maximum_grade: segEffort.segment.maximum_grade,
        name: segEffort.segment.name,
        state: segEffort.segment.state
      }
    };
    return JSON.parse(JSON.stringify(segPerf));
  }
}
