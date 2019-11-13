import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { Rides, Ride } from "../../model/ride";
import { FilterUtils } from "primeng/api";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";

@Component({
  selector: "app-rides-list",
  templateUrl: "./rides-list.component.html",
  styleUrls: ["./rides-list.component.scss"]
})
export class RidesListComponent implements OnInit {
  cols: any[];
  selectedColumns: any[];
  breakPointCols: any[];
  @Input() rides: Rides;
  @Output() rideSelected = new EventEmitter();

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.cols = [
      { field: "nameWithLink", header: "Name" },
      { field: "date", header: "Date" },
      { field: "distance", header: "Dist (km)" },
      { field: "movingTimeFormatted", header: "Moving Time" },
      { field: "average_speed", header: "Avg Speed (kph)" },
      { field: "total_elevation_gain", header: "Elevation gain (m)" },
      { field: "weighted_average_watts", header: "Avg Watts" },
      { field: "average_temp", header: "Avg Temp (c)" },
      { field: "cals", header: "Cals" },
      { field: "achievement_count", header: "Achieve" },
      { field: "pr_count", header: "PR Count" },
      { field: "kudos_count", header: "Kudos" }
    ];

    this.breakPointCols = [
      { break: "1200px", cols: ["achievement_count", "pr_count", "kudos_count"] },
      { break: "992px", cols: ["weighted_average_watts", "average_temp", "cals"] },
      { break: "768px", cols: ["average_speed", "total_elevation_gain"] },
      { break: "576px", cols: ["distance", "movingTimeFormatted"] },
      { break: "450px", cols: ["date"] }
    ];

    this.selectedColumns = this.cols;
    FilterUtils["greaterThan"] = (value, filter): boolean => {
      if (filter === undefined || filter === null || filter.trim() === "") return true;
      if (value === undefined || value === null) return false;
      return parseInt(filter) < value;
    };
    this.breakPoints();
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

  rideDrillDown(ride: Ride) {
    this.rideSelected.emit(ride.id);
  }

  getColFilterType(col: string) {
    if (col === "nameWithLink" || col === "date") return "equals";
    else return "greaterThan";
  }
}
