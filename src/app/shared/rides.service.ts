import { Injectable } from "@angular/core";
import { AngularFirestore, QuerySnapshot } from "@angular/fire/firestore";
import { HttpClient, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { firestore, FirebaseError } from "firebase";
import { mockRides } from "../../assets/model/mock-data";
import { StravaService } from "./strava.service";
import { IRide, ISegPerformance } from "../model/model";

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

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient,
    private stravaService: StravaService
  ) {
    this.calls = new BehaviorSubject(this._calls);
    this.adjMock = this.transformRidesForDisplay(mockRides);
    this.stravaService.incrementCount.subscribe(call => {
      if (call !== null) this.incrementCount(call);
    });
    this.stravaService.propagateMsg.subscribe(msg => {
      if (msg !== null) this.propagateMsg(msg.key, msg.error);
    });
  }

  private incrementCount(call: string) {
    this._calls[call] = ++this._calls[call];
    this.calls.next(this._calls);
  }

  private propagateMsg(key: string, error: string) {
    this._calls[key] = error;
    this.calls.next(this._calls);
  }

  // Main logic for scraping Strava data and saving to database

  scrapeStravaData(page?: number) {
    const pageSize = 50;
    const shouldPage = true;
    const maxPages = 6;
    if (page === undefined) page = 1;

    this.stravaService.getRides(pageSize, page).then((rides: number[]) => {
      console.log(`Got ${rides.length} for page ${page}`);
      rides.forEach((rideId: number) => this.processRide(rideId));
      if (shouldPage && rides.length !== 0 && page <= maxPages) this.scrapeStravaData(++page);
    });
  }

  private processRide(rideId: number) {
    this.getByKeyFromDb("rides", rideId).then((rideFromDb: IRide) => {
      if (rideFromDb !== null && rideFromDb === undefined) {
        this.stravaService.getRide(rideId).then(rideDetails => {
          if (rideDetails !== null) this.saveRideDetails(rideDetails);
          else
            console.log("Ride details are null, I'm guessing there was an error getting the ride");
        });
      }
    });
  }

  private saveRideDetails(rideDetails) {
    const promises: Promise<ISegPerformance>[] = [];
    rideDetails.segEfforts.forEach(segEffort => {
      promises.push(
        this.getByKeyFromDb("segment_performance", [segEffort.segment_id, segEffort.athlete_id])
      );
    });

    Promise.all(promises)
      .catch(res => {
        console.log("Error in promise all");
        console.log(res);
        return null;
      })
      .then(res => {
        if (res === null)
          console.log("res is null, I'm guessing there was an error getting seg perf from the DB");

        if (res !== null) {
          console.log(
            `About to do a batch for ride ${rideDetails.ride.id} with ${rideDetails.segEfforts.length} segments and ${res.length} seg perf already on the database`
          );
          this.startBatch(rideDetails.ride.id);

          this.addDataToBatch("rides", rideDetails.ride.id, rideDetails.ride, rideDetails.ride.id);

          rideDetails.segEfforts.forEach(segEffort => {
            let segPerf;
            res.forEach(segPerformance => {
              if (
                segPerformance !== undefined &&
                segPerformance.segment_id === segEffort.segment.id
              )
                segPerf = segPerformance;
            });

            this.addDataToBatch(
              "segment_performance",
              [segEffort.segment_id, segEffort.althlete_id],
              this.mergeSegEffortAndSegPerf(segEffort, segPerf),
              rideDetails.ride.id
            );

            this.addDataToBatch("segment_efforts", segEffort.id, segEffort, rideDetails.ride.id);
          });

          this.endBatch(rideDetails.ride.id);
        }
      });
  }

  // Logic to refesh perf data with leaderboards

  refreshPerformanceData() {
    this.getPerformanceDataToRefresh().subscribe(
      perfData => {
        this.incrementCount("numDbReadsDone");
        perfData.forEach(segPerformance => {
          if (segPerformance.requires_refresh === true) {
            this.stravaService.getLeaderboard(segPerformance.segment_id).then(leaderboard => {
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

  private applyLeaderboardToSegPerformance(segPerformance, leaderboard) {
    this.updateData(
      "segment_performance",
      [segPerformance.segment_id, segPerformance.athlete_id],
      leaderboard
    );
  }

  // Database access

  private transformRidesForDisplay(rides: IRide[]): IRide[] {
    return rides.map((ride: IRide) => {
      ride.distance = Math.floor(ride.distance / 1000);
      ride.moving_time = Math.floor((ride.moving_time / 60 / 60) * 100) / 100;
      ride.average_speed = Math.floor(ride.average_speed * 3.6 * 10) / 10;
      return ride;
    });
  }

  getRides() {
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

  private getByKeyFromDb(collection: string, key: number | number[]): Promise<any> {
    this.incrementCount("numDbReadsMade");
    return this.firestore
      .collection(collection)
      .doc(this.transformKeyToStore(key))
      .get()
      .toPromise()
      .then(res => {
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
    console.log("Getting seg perf to refresh");
    return this.firestore
      .collection("segment_performance", ref =>
        ref
          .where("requires_refresh", "==", true)
          .orderBy("num_times_ridden", "desc")
          .limit(10)
      )
      .valueChanges();
  }

  private updateData(collection: string, key: number | number[], data) {
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

  private startBatch(rideId: number) {
    this.incrementCount("numDbWritesMade");
    console.log(`Starting batch: ${rideId}`);
    this.batches.set(rideId, [this.firestore.firestore.batch(), 0]);
  }

  private addDataToBatch(collection: string, key: number | number[], data, rideId: number) {
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

  private endBatch(rideId: number) {
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

  private transformKeyToStore(key: number | number[]) {
    if (Array.isArray(key)) {
      let keyToStore: string = "";
      key.forEach(k => {
        keyToStore = keyToStore + "_" + k;
      });
      return keyToStore.substr(1);
    } else return key.toString();
  }

  //API to database mapping

  private getSegEffortLastRidden(segEffort, segPerformance): string {
    if (segPerformance === undefined || segEffort.start_date > segPerformance.last_ridden_date)
      return segEffort.start_date;
    else return segPerformance.last_ridden_date;
  }

  private getSegEffortNumTimesRidden(segPerformance): number {
    if (segPerformance === undefined) return 1;
    else return ++segPerformance.num_times_ridden;
  }

  private getSegEffortRequiresRefresh(segEffort, segPerformance): boolean {
    return (
      segPerformance === undefined ||
      segPerformance.requires_refresh ||
      segEffort.start_date > segPerformance.last_ridden_date
    );
  }

  private mergeSegEffortAndSegPerf(segEffort, segPerformance) {
    return JSON.parse(
      JSON.stringify({
        last_ridden_date: this.getSegEffortLastRidden(segEffort, segPerformance),
        num_times_ridden: this.getSegEffortNumTimesRidden(segPerformance),
        requires_refresh: this.getSegEffortRequiresRefresh(segEffort, segPerformance),
        athlete_id: segEffort.athlete_id,
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
      })
    );
  }
}
