import { Component, OnInit } from "@angular/core";
import { RidesService } from "../../shared/rides.service";

@Component({
  selector: "app-firestore-crud",
  templateUrl: "./firestore-crud.component.html",
  styleUrls: ["./firestore-crud.component.scss"]
})
export class FirestoreCrudComponent implements OnInit {
  calls = {};
  value = 150;
  showValue = false;

  constructor(private ridesService: RidesService) {}

  scrapeStravaData() {
    this.ridesService.scrapeStravaData();
  }

  refreshPerformanceData() {
    this.ridesService.refreshPerformanceData();
  }

  ngOnInit() {
    this.ridesService.calls.subscribe(calls => {
      this.calls = calls;
    });

    // localStorage.setItem("hh", "hf");

    // console.log(localStorage.getItem("hh"));

    // this.ridesService.getSegPerformances();
  }
}
