import { Component, OnInit } from "@angular/core";
import { RidesService } from "../../shared/rides.service";
import { TreeNode } from "primeng/api";

@Component({
  selector: "app-firestore-crud",
  templateUrl: "./firestore-crud.component.html",
  styleUrls: ["./firestore-crud.component.scss"]
})
export class FirestoreCrudComponent implements OnInit {
  calls = {};
  data: TreeNode[];

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

    this.data = [
      {
        label: "Root",
        children: [
          {
            label: "Child 1",
            children: [
              {
                label: "Grandchild 1.1",
                type: "leaf"
              },
              {
                label: "Grandchild 1.2",
                type: "leaf"
              }
            ]
          },
          {
            label: "Child 2",
            children: [
              {
                label: "Child 2.1",
                type: "leaf"
              },
              {
                label: "Child 2.2",
                type: "leaf"
              }
            ]
          }
        ]
      }
    ];
  }
}
