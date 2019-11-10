import { Component, OnInit } from "@angular/core";
import { SegmentPerformances, SegmentEffort } from "src/app/model/segment";
import { RidesService } from "src/app/shared/rides.service";
import { FilterUtils } from "primeng/api";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-seg-efforts-list",
  templateUrl: "./seg-efforts-list.component.html",
  styleUrls: ["./seg-efforts-list.component.scss"]
})
export class SegEffortsListComponent implements OnInit {
  segPerfs: SegmentPerformances;
  segEfforts: SegmentEffort[];
  rideId: number;
  cols: any[];
  selectedColumns: any[];

  constructor(private ridesService: RidesService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.rideId = Number(this.route.snapshot.paramMap.get("id"));
    this.ridesService.getSegPerformances().then((segPerfs: SegmentPerformances) => {
      this.segPerfs = segPerfs;

      this.ridesService.getRideSegments(this.rideId).then(segEfforts => {
        this.segEfforts = this.segPerfs.getSegmentEffortWithPerformance(segEfforts);

        this.cols = [
          { field: "segment_name_with_link", header: "Name" },
          { field: "segment_city", header: "City" },
          { field: "startTime", header: "Start Date" },
          { field: "segment_distance", header: "Distance (km)" },
          { field: "segment_average_grade", header: "Avg Grade (%)" },
          { field: "avgWatts", header: "Avg Watts" },
          { field: "elapsedTime", header: "Time" },
          { field: "secondsBehindPr", header: "Behind PR" },
          { field: "num_times_ridden", header: "Times Ridden" },
          { field: "rank", header: "Rank" },
          { field: "people_above", header: "People Above" },
          { field: "people_below", header: "People Below" },
          { field: "pr_elapsed_time", header: "PR Time" },
          { field: "top_elapsed_time", header: "Top Time" },
          { field: "secondsPrBehindTop", header: "PR Behind Top" }
          // { field: "pr_date", header: "PR Date" },
          // { field: "top_date", header: "Top Date" }
        ];
        this.selectedColumns = this.cols;
        FilterUtils["greaterThan"] = (value, filter): boolean => {
          if (filter === undefined || filter === null || filter.trim() === "") return true;
          if (value === undefined || value === null) return false;
          return parseInt(filter) < value;
        };
      });
    });
  }
}
