import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class RidesService {
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}

  addData(collection, key, data) {
    return new Promise<any>((resolve, reject) => {
      this.firestore
        .collection(collection)
        .doc(key)
        .set(data)
        .then(res => {}, err => reject(err));
    });
  }

  getData() {
    // return this.firestore.collection("rides").snapshotChanges();

    return this.firestore
      .collection("rides", ref => ref.where("athleteid", "==", "1253381"))
      .snapshotChanges()
      .toPromise();
  }

  getRideFromDb(id: number) {
    return this.firestore.collection("rides", ref => ref.where("id", "==", id)).snapshotChanges();
  }

  startStravaStuff() {
    this.getStravaToken().subscribe(token => {
      this.getStravaData(token.access_token, "activities", "&per_page=5").subscribe(rides => {
        console.log(rides);
        rides.forEach(ride => {
          if (ride.type === "Ride") {
            console.log(ride.type);
            this.getRideFromDb(ride.id).subscribe(rideFromDb => {
              if (rideFromDb[0] === undefined) {
                this.getStravaData(token.access_token, `activities/${ride.id}`, "").subscribe(
                  rideDetails => {
                    this.saveRideDetails(rideDetails);
                  }
                );
              }
            });
          }
        });
      });
    });
  }

  saveRideDetails(rideDetails) {
    console.log(rideDetails);
    console.log(this.convertApiRidetoDbRide(rideDetails));
    this.addData("rides", rideDetails.id.toString(), this.convertApiRidetoDbRide(rideDetails));
  }

  convertApiRidetoDbRide(rideDetails) {
    return {
      achievement_count: rideDetails.achievement_count,
      athlete_count: rideDetails.athlete_count,
      athleteid: rideDetails.athlete.id,
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

  getStravaData(token, api, suffix): Observable<any> {
    const baseUrl = "https://www.strava.com/api/v3/";
    const fullUrl = `${baseUrl}${api}?access_token=${token}${suffix}`;
    return this.http.get(fullUrl);
  }

  getStravaToken(): Observable<any> {
    const url = "https://www.strava.com/oauth/token";
    const data = {
      client_id: "39755",
      client_secret: "ab08660dcf7919ca0dac4111a8e1963aa9183c0d",
      code: "072cc35b6b4327aca112a1f9fb1f05709a167288",
      grant_type: "authorization_code"
    };
    return this.http.post(url, data);
  }
}
