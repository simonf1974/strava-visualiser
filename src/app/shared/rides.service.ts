import { Injectable } from "@angular/core";
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
  collections,
  calls
} from "../model/model";
import { DatabaseService } from "./database.service";
import { SegmentService } from "./segment.service";
import { RideService } from "./ride.service";
import { LocaldbService } from "./localdb.service";

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

  private batches: Map<number, [firestore.WriteBatch, number]> = new Map<
    number,
    [firestore.WriteBatch, number]
  >();

  constructor(
    private stravaService: StravaService,
    private localDbService: LocaldbService,
    private remoteDbService: DatabaseService,
    private segmentService: SegmentService,
    private rideService: RideService
  ) {
    this.calls = new BehaviorSubject(this._calls);
    this.initMsgPropogation(this.stravaService);
    this.initMsgPropogation(this.remoteDbService);
    this.initMsgPropogation(this.segmentService);
    this.initMsgPropogation(this.rideService);
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
    this.remoteDbService.get(collections.rides, rideId).then((dbRide: IRide) => {
      if (dbRide !== null && dbRide === undefined) {
        this.stravaService.getRide(rideId).then((apiRide: IRideDetails) => {
          if (apiRide !== null) this.saveRideDetails(apiRide);
          else
            console.log("Ride details are null, I'm guessing there was an error getting the ride");
        });
      }
    });
  }

  private saveRideDetails(apiRide: IRideDetails): void {
    console.log(
      `About to do a batch for ride ${apiRide.ride.id} with ${apiRide.segEfforts.length} segments`
    );
    this.remoteDbService.startBatch(apiRide.ride.id);

    this.remoteDbService.addToBatch(
      collections.rides,
      apiRide.ride.id,
      apiRide.ride,
      apiRide.ride.id
    );

    apiRide.segEfforts.forEach((segEffort: ISegEffort) => {
      this.remoteDbService.addToBatch(
        collections.segmentPerformance,
        [segEffort.segment_id, apiRide.ride.athlete_id],
        this.mergeSegEffortAndSegPerf(segEffort, apiRide.ride.athlete_id),
        apiRide.ride.id
      );
    });

    this.remoteDbService.addToBatch(
      collections.rideSegEfforts,
      apiRide.ride.id,
      { seg_efforts: apiRide.segEfforts },
      apiRide.ride.id
    );

    this.remoteDbService.endBatch(apiRide.ride.id);
  }

  // Logic to refesh perf data with leaderboards

  refreshPerformanceData(): void {
    const segmentsToRefresh: number[] = [];

    this.segmentService.getRequiringRefresh().subscribe(
      (perfData: ISegPerformance[]) => {
        this.incrementCount(calls.numDbReadsDone);
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
        const msg = `Database error in get performance data: Code: ${error.code}, Message: ${error.message}`;
        this.propagateMsg("databaseMsg", msg);
        console.log(msg);
      }
    );
  }

  private applyLeaderboardToSegPerformance(
    segPerformance: ISegPerformance,
    leaderboard: ISegPerfPreUpdate
  ): void {
    this.remoteDbService.update(
      collections.segmentPerformance,
      [segPerformance.segment_id, segPerformance.athlete_id],
      leaderboard
    );
  }

  // Database access

  clearLocalDb() {
    this.incrementCount(calls.numDbWritesMade);
    this.localDbService.clear().then(res => {
      this.rideService.clearLocalDb();
      this.segmentService.clearLocalDb();
      this.incrementCount(calls.numDbWritesDone);
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
