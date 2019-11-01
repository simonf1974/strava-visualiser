import { Component, OnInit } from "@angular/core";
import { RidesService } from "../../shared/rides.service";

@Component({
  selector: "app-firestore-crud",
  templateUrl: "./firestore-crud.component.html",
  styleUrls: ["./firestore-crud.component.scss"]
})
export class FirestoreCrudComponent implements OnInit {
  calls = {};

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
  }
}
