import { Component, OnInit } from "@angular/core";
import { RidesService } from "../../shared/rides.service";
import { ICalls } from "src/app/model/model";

@Component({
  selector: "app-firestore-crud",
  templateUrl: "./firestore-crud.component.html",
  styleUrls: ["./firestore-crud.component.scss"]
})
export class FirestoreCrudComponent implements OnInit {
  calls: ICalls;
  apiCallsProgress: number;
  dbReadsProgress: number;
  dbWritesProgress: number;
  apiCallsMessage: string;
  dbReadsMessage: string;
  dbWritesMessage: string;

  constructor(private ridesService: RidesService) {}

  scrapeStravaData() {
    this.ridesService.scrapeStravaData();
  }

  refreshPerformanceData() {
    this.ridesService.refreshPerformanceData();
  }

  clearLocalDb() {
    this.ridesService.clearLocalDb();
  }

  ngOnInit() {
    this.ridesService.calls.subscribe(calls => {
      this.calls = calls;

      if (calls.numStravaApiCallsMade > 0) {
        this.apiCallsProgress = Math.floor(
          (calls.numStravaApiCallsDone / calls.numStravaApiCallsMade) * 100
        );
        this.apiCallsMessage = `${calls.numStravaApiCallsMade} calls made, ${calls.numStravaApiCallsDone} calls done`;
      } else {
        this.apiCallsProgress = 0;
        this.apiCallsMessage = "No calls made yet";
      }

      if (calls.numDbReadsMade > 0) {
        this.dbReadsProgress = Math.floor((calls.numDbReadsDone / calls.numDbReadsMade) * 100);
        this.dbReadsMessage = `${calls.numDbReadsMade} calls made, ${calls.numDbReadsDone} calls done`;
      } else {
        this.dbReadsProgress = 0;
        this.dbReadsMessage = "No calls made yet";
      }

      if (calls.numDbWritesMade > 0) {
        this.dbWritesProgress = Math.floor((calls.numDbWritesDone / calls.numDbWritesMade) * 100);
        this.dbWritesMessage = `${calls.numDbWritesMade} calls made, ${calls.numDbWritesDone} calls done`;
      } else {
        this.dbWritesProgress = 0;
        this.dbWritesMessage = "No calls made yet";
      }
    });
  }
}
