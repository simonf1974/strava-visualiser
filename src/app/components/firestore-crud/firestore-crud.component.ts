import { Component, OnInit } from "@angular/core";
import { RidesService } from "../../shared/rides.service";

@Component({
  selector: "app-firestore-crud",
  templateUrl: "./firestore-crud.component.html",
  styleUrls: ["./firestore-crud.component.scss"]
})
export class FirestoreCrudComponent implements OnInit {
  constructor(private ridesService: RidesService) {}

  rides;

  key = "2801190643";

  data = {
    achievement_count: 44,
    athlete_count: 1,
    athleteid: 1253381,
    average_cadence: 94.4,
    average_speed: 6.51,
    average_temp: 9,
    average_watts: 121.4,
    calories: 3421,
    comment_count: 0,
    device_watts: true,
    distance: 180088,
    elapsed_time: 34765,
    elev_high: 183.2,
    elev_low: -14.6,
    has_heartrate: false,
    id: 2801190643,
    kudos_count: 6,
    max_speed: 16.8,
    max_watts: 745,
    month: "October",
    moving_time: 27665,
    name: "Morning Ride",
    pr_count: 12,
    start_date: "2019-10-19T05:21:39Z",
    start_date_local: "2019-10-19T06:21:39Z",
    timezone: "(GMT+00:00) Europe/London",
    total_elevation_gain: 1763,
    utc_offset: 3600,
    weighted_average_watts: 139,
    year: 2019
  };

  leaderBoardKey = "2852137";

  leaderBoard = {
    effort_count: 7,
    entries: [
      {
        athlete_name: "Bradley H.",
        elapsed_time: 97,
        moving_time: 97,
        rank: 1,
        start_date: "2017-08-30T06:06:58Z",
        start_date_local: "2017-08-30T07:06:58Z"
      },
      {
        athlete_name: "Simon F.",
        elapsed_time: 101,
        moving_time: 101,
        rank: 2,
        start_date: "2019-07-28T05:33:50Z",
        start_date_local: "2019-07-28T06:33:50Z"
      },
      {
        athlete_name: "Yosl M.",
        elapsed_time: 103,
        moving_time: 103,
        rank: 3,
        start_date: "2019-07-07T09:03:43Z",
        start_date_local: "2019-07-07T10:03:43Z"
      },
      {
        athlete_name: "Aron A.",
        elapsed_time: 115,
        moving_time: 115,
        rank: 4,
        start_date: "2014-09-07T06:15:29Z",
        start_date_local: "2014-09-07T07:15:29Z"
      },
      {
        athlete_name: "Howard S.",
        elapsed_time: 124,
        moving_time: 124,
        rank: 5,
        start_date: "2017-04-14T10:21:25Z",
        start_date_local: "2017-04-14T11:21:25Z"
      },
      {
        athlete_name: "Adi E.",
        elapsed_time: 133,
        moving_time: 133,
        rank: 6,
        start_date: "2014-04-27T08:56:27Z",
        start_date_local: "2014-04-27T09:56:27Z"
      },
      {
        athlete_name: "Simon M.",
        elapsed_time: 164,
        moving_time: 131,
        rank: 7,
        start_date: "2017-08-04T12:38:21Z",
        start_date_local: "2017-08-04T13:38:21Z"
      }
    ],
    entry_count: 7,
    segment_id: 2852137
  };

  segmentData = {
    average_grade: 0.5,
    city: "Edgware",
    climb_category: 0,
    country: "United Kingdom",
    distance: 843.35,
    elevation_high: 49.8,
    elevation_low: 45.6,
    id: 2852137,
    maximum_grade: 6.7,
    name: "Burnt Oak Burn-up",
    state: "Greater London"
  };

  segmentEffortData = {
    average_cadence: 102,
    average_watts: 146.5,
    device_watts: true,
    elapsed_time: 143,
    id: 69779424102,
    moving_time: 109,
    ride_id: 2801190643,
    segment_id: 2852137,
    start_date: "2019-10-19T05:28:49Z",
    start_date_local: "2019-10-19T06:28:49Z"
  };

  addData() {
    this.ridesService.addData("leaderboards", "2852137_1253381", this.leaderBoard);
  }

  getData() {
    this.rides = this.ridesService.getData();
    console.log(this.rides);

    this.ridesService.getData().subscribe(data => {
      console.log(data);
      data.forEach(e => {
        console.log(e.payload.doc.id);
        console.log(e.payload.doc.data());
      });
    });
  }

  ngOnInit() {}
}
