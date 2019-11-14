import { Component, OnInit } from "@angular/core";
import { FilterUtils } from "primeng/api";
import { SegmentPerformances } from "src/app/model/segment";
import { SegmentService } from "src/app/shared/segment.service";

@Component({
  selector: "app-seg-perf-list",
  templateUrl: "./seg-perf-list.component.html",
  styleUrls: ["./seg-perf-list.component.scss"]
})
export class SegPerfListComponent implements OnInit {
  segPerfs: SegmentPerformances;
  cols: any[];
  selectedColumns: any[];
  isReady = false;

  constructor(private segmentService: SegmentService) {}

  ngOnInit() {
    this.segmentService.get().then((segPerfs: SegmentPerformances) => {
      this.segPerfs = segPerfs;
      this.cols = [
        { field: "segment_name_with_link", header: "Name" },
        { field: "segment_city", header: "City" },
        { field: "segment_distance", header: "Distance (km)" },
        { field: "segment_average_grade", header: "Avg Grade (%)" },
        { field: "num_times_ridden", header: "Times Ridden" },
        { field: "rank", header: "Rank" },
        { field: "people_above", header: "People Above" },
        { field: "people_below", header: "People Below" },
        { field: "prElapsedTime", header: "PR Time" },
        { field: "topElapsedTime", header: "Top Time" },
        { field: "secondsPrBehindTop", header: "PR Behind Top" }
      ];
      this.selectedColumns = this.cols;
      FilterUtils["greaterThan"] = (value, filter): boolean => {
        if (filter === undefined || filter === null || filter.trim() === "") return true;
        if (value === undefined || value === null) return false;
        return parseInt(filter) < value;
      };
      this.isReady = true;
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
