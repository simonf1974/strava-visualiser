import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { firestore } from "firebase";

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
    numDbWritesDone: 0
  };
  calls: BehaviorSubject<any>;

  private batches: Map<number, [firestore.WriteBatch, number]> = new Map<
    number,
    [firestore.WriteBatch, number]
  >();

  constructor(private firestore: AngularFirestore, private http: HttpClient) {
    this.calls = new BehaviorSubject(this._calls);
  }

  // Main logic for scraping Strava data and saving to database

  scrapeStravaData() {
    this.getStravaToken().then(token => {
      this.getStravaData(token.access_token, "activities", "&per_page=5").then(rides => {
        rides.forEach(ride => {
          if (ride.type === "Ride") {
            this.processRide(ride, token);
          }
        });
      });
    });
  }

  refreshPerformanceData() {
    const maxCount = 1;
    let count = 0;
    this.getStravaToken().then(token => {
      this.getPerformanceDataToRefresh().subscribe(perfData => {
        this.incrementCount("numDbReadsDone");
        perfData.forEach(segPerformance => {
          console.log(segPerformance);
          if (++count <= maxCount) {
            this.getStravaData(
              token.access_token,
              `/segments/${segPerformance.segment_id}/leaderboard`,
              "&following=true"
            ).then(leaderboard => {
              console.log(leaderboard);
              this.applyLeaderboardToSegPerformance(segPerformance, leaderboard);
            });
          }
        });
      });
    });
  }

  private applyLeaderboardToSegPerformance(segPerformance, leaderboard) {
    // console.log(this.overlayLeaderboardOntoSegPerformance(leaderboard));
    this.updateData(
      "segment_performance",
      [segPerformance.segment_id, segPerformance.athlete_id],
      this.overlayLeaderboardOntoSegPerformance(leaderboard)
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

    return {
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
    };
  }

  private processRide(ride, token) {
    this.getByKeyFromDb("rides", ride.id).then(rideFromDb => {
      if (rideFromDb.data() === undefined) {
        this.getStravaData(token.access_token, `activities/${ride.id}`, "").then(rideDetails => {
          this.saveRideDetails(rideDetails);
        });
      }
    });
  }

  private saveRideDetails(rideDetails) {
    const promises: Promise<firestore.DocumentSnapshot>[] = [];
    rideDetails.segment_efforts.forEach(segEffort => {
      promises.push(
        this.getByKeyFromDb("segment_performance", [segEffort.segment.id, segEffort.athlete.id])
      );
    });

    Promise.all(promises).then(res => {
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
          if (segPerfData !== undefined && segPerfData.segment_id === segEffort.segment.id)
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
    });
  }

  // Database access

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
      });
  }

  private getPerformanceDataToRefresh(): Observable<any> {
    this.incrementCount("numDbReadsMade");
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
    console.log(this.transformKeyToStore(key));
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
    const batch = this.batches.get(rideId)[0];
    batch.commit().then(res => {
      this.incrementCount("numDbWritesDone");
      this.batches.delete(rideId);
    });
  }

  private incrementCount(call: string) {
    this._calls[call] = ++this._calls[call];
    this.calls.next(this._calls);
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

  private getStravaData(token: string, api: string, suffix: string): Promise<any> {
    const baseUrl = "https://www.strava.com/api/v3/";
    const fullUrl = `${baseUrl}${api}?access_token=${token}${suffix}`;
    this.incrementCount("numStravaApiCallsMade");
    return this.http
      .get(fullUrl)
      .toPromise()
      .then(res => {
        this.incrementCount("numStravaApiCallsDone");
        return res;
      });
  }

  //API to database mapping

  private convertApiSegEffortToDbFormat(segEffort, rideId: number) {
    return {
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
    };
  }

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

  private convertApiSegPerformanceToDbFormat(segEffort, segPerformance) {
    return {
      last_ridden_date: this.getSegEffortLastRidden(segEffort, segPerformance),
      num_times_ridden: this.getSegEffortNumTimesRidden(segPerformance),
      requires_refresh: this.getSegEffortRequiresRefresh(segEffort, segPerformance),
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
    };
  }

  private convertApiRideToDbFormat(rideDetails) {
    return {
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
    };
  }
}
