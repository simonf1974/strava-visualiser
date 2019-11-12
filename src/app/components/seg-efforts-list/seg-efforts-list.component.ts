import { Component, OnInit, Input } from "@angular/core";
import { SegmentEffort } from "src/app/model/segment";
import { FilterUtils } from "primeng/api";
import { ActivatedRoute } from "@angular/router";
import { SegmentService } from "src/app/shared/segment.service";

@Component({
  selector: "app-seg-efforts-list",
  templateUrl: "./seg-efforts-list.component.html",
  styleUrls: ["./seg-efforts-list.component.scss"]
})
export class SegEffortsListComponent implements OnInit {
  segEfforts: SegmentEffort[];
  cols: any[];
  selectedColumns: any[];
  @Input() inputRideId: number;

  constructor(private segmentService: SegmentService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.segmentService.getRideSegments(this.inputRideId).then((segEfforts: SegmentEffort[]) => {
      this.segEfforts = segEfforts;

      this.cols = [
        { field: "segment_name_with_link", header: "Name" },
        { field: "segment_city", header: "City" },
        { field: "startTime", header: "Start Date" },
        { field: "segment_distance", header: "Distance (km)" },
        { field: "segment_average_grade", header: "Avg Grade (%)" },
        { field: "elapsedTime", header: "Time" },
        { field: "secondsBehindPr", header: "Behind PR" },
        { field: "num_times_ridden", header: "Times Ridden" },
        { field: "rank", header: "Rank" },
        { field: "people_above", header: "People Above" },
        { field: "people_below", header: "People Below" },
        { field: "pr_elapsed_time", header: "PR Time" },
        { field: "top_elapsed_time", header: "Top Time" },
        { field: "secondsPrBehindTop", header: "PR Behind Top" }
      ];
      this.selectedColumns = this.cols;
      FilterUtils["greaterThan"] = (value, filter): boolean => {
        if (filter === undefined || filter === null || filter.trim() === "") return true;
        if (value === undefined || value === null) return false;
        return parseInt(filter) < value;
      };
    });
  }

  getColFilterType(col: string) {
    if (
      col === "segment_name_with_link" ||
      col === "segment_city" ||
      col === "people_above" ||
      col === "people_below"
    )
      return "equals";
    else return "greaterThan";
  }
}
