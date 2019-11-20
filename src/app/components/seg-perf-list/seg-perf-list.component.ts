import { Component, OnInit } from "@angular/core";
import { FilterUtils } from "primeng/api";
import { SegmentPerformances } from "src/app/model/segment";
import { SegmentService } from "src/app/shared/segment.service";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";

@Component({
  selector: "app-seg-perf-list",
  templateUrl: "./seg-perf-list.component.html",
  styleUrls: ["./seg-perf-list.component.scss"]
})
export class SegPerfListComponent implements OnInit {
  segPerfs: SegmentPerformances;
  cols: any[];
  selectedColumns: any[];
  breakPointCols: any[];
  isReady = false;

  constructor(
    private segmentService: SegmentService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.segmentService.get().then((segPerfs: SegmentPerformances) => {
      this.segPerfs = segPerfs;
      this.cols = [
        { field: "segment_name", header: "Name" },
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

      this.breakPointCols = [
        { break: "1400px", cols: ["people_above", "people_below"] },
        { break: "1200px", cols: ["prElapsedTime", "topElapsedTime", "secondsPrBehindTop"] },
        { break: "992px", cols: ["num_times_ridden", "rank"] },
        { break: "768px", cols: ["segment_average_grade"] },
        { break: "576px", cols: ["segment_distance"] },
        { break: "450px", cols: ["segment_city"] }
      ];

      FilterUtils["greaterThan"] = (value, filter): boolean => {
        if (filter === undefined || filter === null || filter.trim() === "") return true;
        if (value === undefined || value === null) return false;
        return parseInt(filter) < value;
      };
      this.isReady = true;
      this.breakPoints();
    });
  }

  getColFilterType(col: string) {
    if (
      col === "segment_name" ||
      col === "segment_city" ||
      col === "people_above" ||
      col === "people_below"
    )
      return "equals";
    else return "greaterThan";
  }

  breakPoints() {
    this.breakpointObserver
      .observe(this.breakPointCols.map(bp => `(min-width: ${bp.break})`))
      .subscribe((state: BreakpointState) => {
        this.selectedColumns = this.cols;
        this.breakPointCols.forEach(bp => {
          const breakMatch: boolean = state.breakpoints[`(min-width: ${bp.break})`];
          if (!breakMatch)
            this.selectedColumns = this.selectedColumns.filter(col => !bp.cols.includes(col.field));
        });
      });
  }
}
