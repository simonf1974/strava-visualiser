import { Injectable } from "@angular/core";
import { AngularFirestore, QuerySnapshot } from "@angular/fire/firestore";
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { firestore, FirebaseError } from "firebase";

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

  private batches: Map<number, [firestore.WriteBatch, number]> = new Map<
    number,
    [firestore.WriteBatch, number]
  >();

  constructor(private firestore: AngularFirestore, private http: HttpClient) {
    this.calls = new BehaviorSubject(this._calls);
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
    const pageSize = 125;
    const shouldPage = false;

    if (page === undefined) page = 1;
    this.getStravaToken().then(token => {
      this.getStravaData(
        token.access_token,
        "activities",
        `&per_page=${pageSize}&page=${page}`
      ).then(rides => {
        if (rides !== null) {
          console.log(`Got ${rides.length} for page ${page}`);
          rides.forEach(ride => {
            if (ride.type === "Ride") {
              this.processRide(ride.id, token);
            }
          });
          if (shouldPage && rides.length === pageSize) {
            this.scrapeStravaData(++page);
          }
        }
      });
    });
  }

  private processRide(rideId, token) {
    this.getByKeyFromDb("rides", rideId).then(rideFromDb => {
      if (rideFromDb !== null && rideFromDb.data() === undefined) {
        this.getStravaData(token.access_token, `activities/${rideId}`, "").then(
          rideDetails => {
            if (rideDetails !== null) this.saveRideDetails(rideDetails);
            else
              console.log(
                "Ride details are null, I'm guessing there was an error getting the ride"
              );
          }
        );
      }
    });
  }

  private saveRideDetails(rideDetails) {
    const promises: Promise<firestore.DocumentSnapshot>[] = [];
    rideDetails.segment_efforts.forEach(segEffort => {
      promises.push(
        this.getByKeyFromDb("segment_performance", [
          segEffort.segment.id,
          segEffort.athlete.id
        ])
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
          console.log(
            "res is null, I'm guessing there was an error getting seg perf from the DB"
          );

        if (res !== null) {
          console.log(
            `About to do a batch for ride ${rideDetails.id} with ${rideDetails.segment_efforts.length} segments and ${res.length} seg perf already on the database`
          );
          this.startBatch(rideDetails.id);

          this.addDataToBatch(
            "rides",
            rideDetails.id,
            this.convertApiRideToDbFormat(rideDetails),
            rideDetails.id
          );

          rideDetails.segment_efforts.forEach(segEffort => {
            let segPerf;
            res.forEach(segPerformance => {
              const segPerfData = segPerformance.data();
              if (
                segPerfData !== undefined &&
                segPerfData.segment_id === segEffort.segment.id
              )
                segPerf = segPerfData;
            });

            this.addDataToBatch(
              "segment_performance",
              [segEffort.segment.id, segEffort.athlete.id],
              this.convertApiSegPerformanceToDbFormat(segEffort, segPerf),
              rideDetails.id
            );

            this.addDataToBatch(
              "segment_efforts",
              segEffort.id,
              this.convertApiSegEffortToDbFormat(segEffort, rideDetails.id),
              rideDetails.id
            );
          });

          this.endBatch(rideDetails.id);
        }
      });
  }

  // Logic to refesh perf data with leaderboards

  refreshPerformanceData() {
    this.getStravaToken().then(token => {
      this.getPerformanceDataToRefresh().subscribe(
        perfData => {
          this.incrementCount("numDbReadsDone");
          perfData.forEach(segPerformance => {
            if (segPerformance.requires_refresh === true) {
              this.getStravaData(
                token.access_token,
                `/segments/${segPerformance.segment_id}/leaderboard`,
                "&following=true"
              ).then(leaderboard => {
                if (leaderboard !== null)
                  this.applyLeaderboardToSegPerformance(
                    segPerformance,
                    leaderboard
                  );
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
    });
  }

  private applyLeaderboardToSegPerformance(segPerformance, leaderboard) {
    this.updateData(
      "segment_performance",
      [segPerformance.segment_id, segPerformance.athlete_id],
      this.overlayLeaderboardOntoSegPerformance(leaderboard)
    );
  }

  // Database access

  getRides() {
    return this.firestore
      .collection("rides", ref => ref.limit(1000))
      .get()
      .toPromise()
      .then(res => {
        // console.log(res.docs);
        return res.docs.map(ride => ride.data());
      });
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

  private getByKeyFromDb(collection: string, key: number | number[]) {
    this.incrementCount("numDbReadsMade");
    return this.firestore
      .collection(collection)
      .doc(this.transformKeyToStore(key))
      .get()
      .toPromise()
      .then(res => {
        this.incrementCount("numDbReadsDone");
        return res;
      })
      .catch((res: FirebaseError) => {
        this.incrementCount("numDbReadsDone");
        this.propagateMsg(
          "databaseMsg",
          `Database error in get by key: Code: ${res.code}, Message: ${res.message}`
        );
        console.log(
          `Database error: Code: ${res.code}, Message: ${res.message}`
        );
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
          .limit(1)
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

  private addDataToBatch(
    collection: string,
    key: number | number[],
    data,
    rideId: number
  ) {
    const itemRef = this.firestore
      .collection(collection)
      .doc(this.transformKeyToStore(key)).ref;

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

  //Strava API calls

  private getStravaToken(): Promise<any> {
    const url = "https://www.strava.com/oauth/token";
    const data = {
      client_id: "39755",
      client_secret: "ab08660dcf7919ca0dac4111a8e1963aa9183c0d",
      code: "072cc35b6b4327aca112a1f9fb1f05709a167288",
      grant_type: "authorization_code"
    };
    return this.http.post(url, data).toPromise();
  }

  private getStravaData(
    token: string,
    api: string,
    suffix: string
  ): Promise<any> {
    const baseUrl = "https://www.strava.com/api/v3/";
    const fullUrl = `${baseUrl}${api}?access_token=${token}${suffix}`;
    this.incrementCount("numStravaApiCallsMade");
    return this.http
      .get(fullUrl, { observe: "response" })
      .toPromise()
      .then((res: HttpResponse<any>) => {
        this.incrementCount("numStravaApiCallsDone");
        this.propagateMsg(
          "httpDetails",
          `HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}`
        );
        console.log(
          `Strava API succeeded: HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}`
        );
        if (res.status === 200) return res.body;
        else return null;
      })
      .catch((res: HttpErrorResponse) => {
        this.incrementCount("numStravaApiCallsDone");
        this.propagateMsg(
          "httpDetails",
          `HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}, Message: ${res.error.message}`
        );
        console.log(
          `Strava API error: HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}, Message: ${res.error.message}`
        );
        return null;
      });
  }

  //API to database mapping

  private convertApiSegEffortToDbFormat(segEffort, rideId: number) {
    return JSON.parse(
      JSON.stringify({
        average_cadence: segEffort.average_cadence,
        average_watts: segEffort.average_watts,
        device_watts: segEffort.device_watts,
        elapsed_time: segEffort.elapsed_time,
        id: segEffort.id,
        moving_time: segEffort.moving_time,
        ride_id: rideId,
        althlete_id: segEffort.athlete.id,
        segment_id: segEffort.segment.id,
        start_date: segEffort.start_date,
        start_date_local: segEffort.start_date_local,
        segment: {
          average_grade: segEffort.segment.average_grade,
          city: segEffort.segment.city,
          climb_category: segEffort.segment.climb_category,
          country: segEffort.segment.country,
          distance: segEffort.segment.distance,
          elevation_high: segEffort.segment.elevation_high,
          elevation_low: segEffort.segment.elevation_low,
          id: segEffort.segment.id,
          maximum_grade: segEffort.segment.maximum_grade,
          name: segEffort.segment.name,
          state: segEffort.segment.state
        }
      })
    );
  }

  private getSegEffortLastRidden(segEffort, segPerformance): string {
    if (
      segPerformance === undefined ||
      segEffort.start_date > segPerformance.last_ridden_date
    )
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

  private convertApiSegPerformanceToDbFormat(segEffort, segPerformance) {
    return JSON.parse(
      JSON.stringify({
        last_ridden_date: this.getSegEffortLastRidden(
          segEffort,
          segPerformance
        ),
        num_times_ridden: this.getSegEffortNumTimesRidden(segPerformance),
        requires_refresh: this.getSegEffortRequiresRefresh(
          segEffort,
          segPerformance
        ),
        athlete_id: segEffort.athlete.id,
        segment_id: segEffort.segment.id,
        segment: {
          average_grade: segEffort.segment.average_grade,
          city: segEffort.segment.city,
          climb_category: segEffort.segment.climb_category,
          country: segEffort.segment.country,
          distance: segEffort.segment.distance,
          elevation_high: segEffort.segment.elevation_high,
          elevation_low: segEffort.segment.elevation_low,
          id: segEffort.segment.id,
          maximum_grade: segEffort.segment.maximum_grade,
          name: segEffort.segment.name,
          state: segEffort.segment.state
        }
      })
    );
  }

  private convertApiRideToDbFormat(rideDetails) {
    return JSON.parse(
      JSON.stringify({
        achievement_count: rideDetails.achievement_count,
        athlete_count: rideDetails.athlete_count,
        athlete_id: rideDetails.athlete.id,
        average_cadence: rideDetails.average_cadence,
        average_speed: rideDetails.average_speed,
        average_temp: rideDetails.average_temp,
        average_watts: rideDetails.average_watts,
        calories: rideDetails.calories,
        comment_count: rideDetails.comment_count,
        device_watts: rideDetails.device_watts,
        distance: rideDetails.distance,
        elapsed_time: rideDetails.elapsed_time,
        elev_high: rideDetails.elev_high,
        elev_low: rideDetails.elev_low,
        has_heartrate: rideDetails.has_heartrate,
        id: rideDetails.id,
        kudos_count: rideDetails.kudos_count,
        max_speed: rideDetails.max_speed,
        max_watts: rideDetails.max_watts,
        month: rideDetails.start_date.slice(5, 7),
        moving_time: rideDetails.moving_time,
        name: rideDetails.name,
        pr_count: rideDetails.pr_count,
        start_date: rideDetails.start_date,
        start_date_local: rideDetails.start_date_local,
        timezone: rideDetails.timezone,
        total_elevation_gain: rideDetails.total_elevation_gain,
        utc_offset: rideDetails.utc_offset,
        weighted_average_watts: rideDetails.weighted_average_watts,
        year: rideDetails.start_date.slice(0, 4)
      })
    );
  }

  private overlayLeaderboardOntoSegPerformance(leaderboard) {
    let mainEntry;
    let peopleAbove: string[] = [];
    let peopleBelow: string[] = [];

    leaderboard.entries.forEach(entry => {
      if (entry.athlete_name === "Simon F.") mainEntry = entry;
      else if (mainEntry === undefined) {
        peopleAbove.push(entry.athlete_name);
      } else {
        peopleBelow.push(entry.athlete_name);
      }
    });

    return JSON.parse(
      JSON.stringify({
        requires_refresh: false,
        people_above: peopleAbove.join(", "),
        people_below: peopleBelow.join(", "),
        rank: mainEntry.rank,
        pr_date: mainEntry.start_date,
        pr_date_local: mainEntry.start_date_local,
        pr_elapsed_time: mainEntry.elapsed_time,
        pr_moving_time: mainEntry.moving_time,
        top_date: leaderboard.entries[0].start_date,
        top_date_local: leaderboard.entries[0].start_date_local,
        top_elapsed_time: leaderboard.entries[0].elapsed_time,
        top_moving_time: leaderboard.entries[0].moving_time,
        entries: leaderboard.entries
      })
    );
  }
}

export interface IRide {
  achievement_count: number;
  athlete_count: number;
  athlete_id: number;
  average_cadence: number;
  average_speed: number;
  average_temp: number;
  average_watts: number;
  calories: number;
  comment_count: number;
  device_watts: boolean;
  distance: number;
  elapsed_time: number;
  elev_high: number;
  elev_low: number;
  has_heartrate: boolean;
  id: number;
  kudos_count: number;
  max_speed: number;
  max_watts: number;
  month: string;
  moving_time: number;
  name: string;
  pr_count: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  total_elevation_gain: number;
  utc_offset: number;
  weighted_average_watts: number;
  year: string;
}
