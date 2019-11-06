import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentSnapshot, CollectionReference } from "@angular/fire/firestore";
import { BehaviorSubject, Observable } from "rxjs";
import { firestore, FirebaseError } from "firebase";
import { StravaService } from "./strava.service";
import {
  IRide,
  ISegPerformance,
  IRideDetails,
  ISegEffort,
  ISegPerfPreUpdate,
  ISegPerfPreSave
} from "../model/model";

@Injectable({
  providedIn: "root"
})
export class RidesService {
  private _calls = {
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
  adjMock: IRide[];

  private batches: Map<number, [firestore.WriteBatch, number]> = new Map<
    number,
    [firestore.WriteBatch, number]
  >();

  constructor(private firestore: AngularFirestore, private stravaService: StravaService) {
    this.calls = new BehaviorSubject(this._calls);
    this.stravaService.incrementCount.subscribe(call => {
      if (call !== null) this.incrementCount(call);
    });
    this.stravaService.propagateMsg.subscribe(msg => {
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
    this.getByKeyFromDb("rides", rideId).then((rideFromDb: IRide) => {
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
    this.startBatch(rideDetails.ride.id);

    this.addDataToBatch("rides", rideDetails.ride.id, rideDetails.ride, rideDetails.ride.id);

    rideDetails.segEfforts.forEach((segEffort: ISegEffort) => {
      this.addDataToBatch(
        "segment_performance",
        [segEffort.segment_id, rideDetails.ride.athlete_id],
        this.mergeSegEffortAndSegPerf(segEffort, rideDetails.ride.athlete_id),

        rideDetails.ride.id
      );
    });

    this.addDataToBatch(
      "ride_seg_efforts",
      rideDetails.ride.id,
      { seg_efforts: rideDetails.segEfforts },
      rideDetails.ride.id
    );

    this.endBatch(rideDetails.ride.id);
  }

  // Logic to refesh perf data with leaderboards

  refreshPerformanceData(): void {
    const segmentsToRefresh: number[] = [];

    this.getPerformanceDataToRefresh().subscribe(
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
    this.updateData(
      "segment_performance",
      [segPerformance.segment_id, segPerformance.athlete_id],
      leaderboard
    );
  }

  // Database access

  getRides(): Promise<IRide[]> {
    return new Promise(resolve => {
      resolve(this.adjMock);
    });

    // return this.firestore
    //   .collection("rides", ref => ref.limit(1000))
    //   .get()
    //   .toPromise()
    //   .then(res => {
    //     // console.log(res.docs);
    //     return res.docs.map(ride => ride.data());
    //   });

    // .catch((res: FirebaseError) => {
    //   this.incrementCount("numDbReadsDone");
    //   this.propagateMsg(
    //     "databaseMsg",
    //     `Database error in get by key: Code: ${res.code}, Message: ${res.message}`
    //   );
    //   console.log(
    //     `Database error: Code: ${res.code}, Message: ${res.message}`
    //   );
    //   return null;
    // });
  }

  getSegPerformances() {
    // return new Promise(resolve => {
    //   resolve(this.adjMock);
    // });
    return this.firestore
      .collection("segment_performance", (ref: CollectionReference) =>
        ref
          .where("num_entries", ">", 1)
          .orderBy("num_entries", "desc")
          .orderBy("num_times_ridden", "desc")
          .limit(2)
      )
      .get()
      .toPromise()
      .then(res => {
        console.log(res.docs[0].data());
        return res.docs.map(segPerfs => segPerfs.data());
      });
    // .valueChanges()
    // .subscribe(segPerfs => {
    //   return segPerfs;
    // });
  }

  private getByKeyFromDb(collection: string, key: number | number[]): Promise<any> {
    this.incrementCount("numDbReadsMade");
    return this.firestore
      .collection(collection)
      .doc(this.transformKeyToStore(key))
      .get()
      .toPromise()
      .then((res: DocumentSnapshot<any>) => {
        this.incrementCount("numDbReadsDone");
        return res.data();
      })
      .catch((res: FirebaseError) => {
        this.incrementCount("numDbReadsDone");
        this.propagateMsg(
          "databaseMsg",
          `Database error in get by key: Code: ${res.code}, Message: ${res.message}`
        );
        console.log(`Database error: Code: ${res.code}, Message: ${res.message}`);
        return null;
      });
  }

  private getPerformanceDataToRefresh(): Observable<any> {
    this.incrementCount("numDbReadsMade");
    return this.firestore
      .collection("segment_performance", (ref: CollectionReference) =>
        ref
          .where("requires_refresh", "==", true)
          // .orderBy("num_times_ridden", "desc")
          .limit(10)
      )
      .valueChanges();
  }

  private updateData(collection: string, key: number | number[], data): Promise<any> {
    this.incrementCount("numDbWritesMade");
    console.log(`Updating this seg perf: ${this.transformKeyToStore(key)}`);
    return new Promise<any>((resolve, reject) => {
      this.firestore
        .collection(collection)
        .doc(this.transformKeyToStore(key))
        .update(data)
        .then(
          res => {
            this.incrementCount("numDbWritesDone");
          },
          err => reject(err)
        );
    });
  }

  private startBatch(rideId: number): void {
    this.incrementCount("numDbWritesMade");
    this.batches.set(rideId, [this.firestore.firestore.batch(), 0]);
  }

  private addDataToBatch(collection: string, key: number | number[], data, rideId: number): void {
    const itemRef = this.firestore.collection(collection).doc(this.transformKeyToStore(key)).ref;

    const batch = this.batches.get(rideId)[0];
    let count: number = this.batches.get(rideId)[1];
    this.batches.set(rideId, [batch, ++count]);

    if (this.batches.get(rideId)[1] === 495) {
      this.endBatch(rideId);
      this.startBatch(rideId);
    }
    this.batches.get(rideId)[0].set(itemRef, data, { merge: true });
  }

  private endBatch(rideId: number): void {
    console.log(`Ending batch: ${rideId}`);
    const batch = this.batches.get(rideId)[0];

    batch
      .commit()
      .then(res => {
        this.incrementCount("numDbWritesDone");
        this.batches.delete(rideId);
      })
      .catch(res => {
        console.log("Error ending batch");
        console.log(res);
      });
  }

  private transformKeyToStore(key: number | number[]): string {
    if (Array.isArray(key)) {
      let keyToStore: string = "";
      key.forEach(k => {
        keyToStore = keyToStore + "_" + k;
      });
      return keyToStore.substr(1);
    } else return key.toString();
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
