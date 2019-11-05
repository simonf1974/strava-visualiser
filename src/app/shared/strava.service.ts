import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import {
  IRide,
  ISegPerfPreUpdate,
  IRideDetails,
  ISegEffort,
  ILeaderboardEntry
} from "../model/model";

@Injectable({
  providedIn: "root"
})
export class StravaService {
  incrementCount: BehaviorSubject<any>;
  propagateMsg: BehaviorSubject<any>;
  token: string;

  constructor(private http: HttpClient) {
    this.incrementCount = new BehaviorSubject(null);
    this.propagateMsg = new BehaviorSubject(null);
  }

  //Strava API calls

  private getStravaToken(): Promise<string> {
    if (this.token !== undefined)
      return new Promise(resolve => {
        console.log("already got a token");
        resolve(this.token);
      });

    console.log("need to get a token");

    const url = "https://www.strava.com/oauth/token";
    const data = {
      client_id: "39755",
      client_secret: "ab08660dcf7919ca0dac4111a8e1963aa9183c0d",
      code: "072cc35b6b4327aca112a1f9fb1f05709a167288",
      grant_type: "authorization_code"
    };
    return this.http
      .post(url, data)
      .toPromise()
      .then((token: any) => {
        this.token = token.access_token;
        return this.token;
      });
  }

  getRides(pageSize: number, page: number): Promise<number[]> {
    return this.getStravaData("activities", `&per_page=${pageSize}&page=${page}`).then(rides => {
      if (rides === null) return [];
      else return rides.filter(ride => ride.type === "Ride").map(ride => ride.id);
    });
  }

  getLeaderboard(segmentId: number): Promise<ISegPerfPreUpdate> {
    return this.getStravaData(`/segments/${segmentId}/leaderboard`, "&following=true").then(
      leaderboard => {
        if (leaderboard === null) return null;
        return this.convertApiLeaderboardToSegPerfDbFormat(leaderboard);
      }
    );
  }

  getRide(rideId: number): Promise<IRideDetails> {
    return this.getStravaData(`activities/${rideId}`, "").then(ride => {
      if (ride === null) return null;
      else {
        const convertedRide: IRide = this.convertApiRideToDbFormat(ride);
        const convertedSegEfforts: ISegEffort[] = ride.segment_efforts.map(
          (segEffort: ISegEffort) => this.convertApiSegEffortToDbFormat(segEffort, convertedRide.id)
        );
        return { ride: convertedRide, segEfforts: convertedSegEfforts };
      }
    });
  }

  private async getStravaData(api: string, suffix: string): Promise<any> {
    const token: string = await this.getStravaToken();
    const baseUrl = "https://www.strava.com/api/v3/";
    const fullUrl = `${baseUrl}${api}?access_token=${token}${suffix}`;

    this.incrementCount.next("numStravaApiCallsMade");
    return this.http
      .get(fullUrl, { observe: "response" })
      .toPromise()
      .then((res: HttpResponse<any>) => {
        this.incrementCount.next("numStravaApiCallsDone");
        this.propagateMsg.next({
          key: "httpDetails",
          error: `HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}`
        });
        console.log(
          `Strava API succeeded: HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}`
        );
        if (res.status === 200) return res.body;
        else return null;
      })
      .catch((res: HttpErrorResponse) => {
        this.incrementCount.next("numStravaApiCallsDone");
        this.propagateMsg.next({
          key: "httpDetails",
          error: `HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}, Message: ${res.error.message}`
        });
        console.log(
          `Strava API error: HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}, Message: ${res.error.message}`
        );
        return null;
      });
  }

  //API to database mapping

  private removeUndefined(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private convertApiSegEffortToDbFormat(segEffort, rideId: number): ISegEffort {
    const dbSegEffort: ISegEffort = {
      average_cadence: segEffort.average_cadence,
      average_watts: segEffort.average_watts,
      device_watts: segEffort.device_watts,
      elapsed_time: segEffort.elapsed_time,
      id: segEffort.id,
      moving_time: segEffort.moving_time,
      segment_id: segEffort.segment.id,
      start_date: segEffort.start_date,
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
    return this.removeUndefined(dbSegEffort);
  }

  private convertApiRideToDbFormat(rideDetails): IRide {
    const distance = Math.floor(rideDetails.distance / 1000);
    const movingTime = Math.floor((rideDetails.moving_time / 60 / 60) * 100) / 100;
    const averageSpeed = Math.floor(rideDetails.average_speed * 3.6 * 10) / 10;
    const elapsedTime = Math.floor((rideDetails.elapsed_time / 60 / 60) * 100) / 100;
    const maxSpeed = Math.floor(rideDetails.average_speed * 3.6 * 10) / 10;

    const rideDate = new Date(rideDetails.start_date);
    const dbRide: IRide = {
      achievement_count: rideDetails.achievement_count,
      athlete_count: rideDetails.athlete_count,
      athlete_id: rideDetails.athlete.id,
      average_cadence: rideDetails.average_cadence,
      average_speed: averageSpeed,
      average_temp: rideDetails.average_temp,
      average_watts: rideDetails.average_watts,
      calories: rideDetails.calories,
      comment_count: rideDetails.comment_count,
      device_watts: rideDetails.device_watts,
      distance: distance,
      elapsed_time: elapsedTime,
      elev_high: rideDetails.elev_high,
      elev_low: rideDetails.elev_low,
      has_heartrate: rideDetails.has_heartrate,
      id: rideDetails.id,
      kudos_count: rideDetails.kudos_count,
      max_speed: maxSpeed,
      max_watts: rideDetails.max_watts,
      month: rideDetails.toLocaleString("default", { month: "long" }),
      moving_time: movingTime,
      name: rideDetails.name,
      pr_count: rideDetails.pr_count,
      start_date: rideDetails.start_date,
      total_elevation_gain: rideDetails.total_elevation_gain,
      weighted_average_watts: rideDetails.weighted_average_watts,
      year: rideDate.getFullYear()
    };
    return this.removeUndefined(dbRide);
  }

  private convertApiLeaderboardToSegPerfDbFormat(leaderboard): ISegPerfPreUpdate {
    let mainEntry: ILeaderboardEntry;
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

    const dbEntries: ILeaderboardEntry[] = leaderboard.entries.map(entry => {
      const ent: ILeaderboardEntry = {
        athlete_name: entry.athlete_name,
        elapsed_time: entry.elapsed_time,
        moving_time: entry.moving_time,
        start_date: entry.start_date,
        rank: entry.entry
      };
      return ent;
    });

    const dbSegPerf: ISegPerfPreUpdate = {
      requires_refresh: false,
      people_above: peopleAbove.join(", "),
      people_below: peopleBelow.join(", "),
      rank: mainEntry.rank,
      num_entries: leaderboard.entries.count,
      pr_date: mainEntry.start_date,
      pr_elapsed_time: mainEntry.elapsed_time,
      pr_moving_time: mainEntry.moving_time,
      top_date: leaderboard.entries[0].start_date,
      top_elapsed_time: leaderboard.entries[0].elapsed_time,
      top_moving_time: leaderboard.entries[0].moving_time,
      entries: dbEntries
    };
    return this.removeUndefined(dbSegPerf);
  }
}
