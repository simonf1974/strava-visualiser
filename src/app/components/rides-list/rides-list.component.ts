import { Component, OnInit } from "@angular/core";
import { Rides, Ride } from "../../model/ride";
import { FilterUtils } from "primeng/api";
import { Router } from "@angular/router";
import { RideService } from "src/app/shared/ride.service";

@Component({
  selector: "app-rides-list",
  templateUrl: "./rides-list.component.html",
  styleUrls: ["./rides-list.component.scss"]
})
export class RidesListComponent implements OnInit {
  rides: Rides;
  cols: any[];
  selectedColumns: any[];
  rideDrillDowns: Ride[] = [];
  activeIndex = 0;

  constructor(private rideService: RideService, private router: Router) {}

  ngOnInit() {
    this.rideService.get().then((rides: Rides) => {
      this.rides = rides;
      this.cols = [
        { field: "nameWithLink", header: "Name" },
        { field: "date", header: "Date" },
        { field: "distance", header: "Dist (km)" },
        { field: "movingTimeFormatted", header: "Moving Time (hrs)" },
        { field: "average_speed", header: "Avg Speed (kph)" },
        { field: "total_elevation_gain", header: "Elevation gain (m)" },
        { field: "weighted_average_watts", header: "Avg Watts" },
        { field: "average_temp", header: "Avg Temp (c)" },
        { field: "cals", header: "Cals" },
        { field: "achievement_count", header: "Achieve" },
        { field: "pr_count", header: "PR Count" },
        { field: "kudos_count", header: "Kudos" }
      ];
      this.selectedColumns = this.cols;
      FilterUtils["greaterThan"] = (value, filter): boolean => {
        if (filter === undefined || filter === null || filter.trim() === "") return true;
        if (value === undefined || value === null) return false;
        return parseInt(filter) < value;
      };
    });
  }

  rideDrillDown(ride: Ride) {
    this.rideDrillDowns.push(ride);
  }

  getColFilterType(col: string) {
    if (col === "nameWithLink" || col === "date") return "equals";
    else return "greaterThan";
  }
}
