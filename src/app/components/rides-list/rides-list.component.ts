import { Component, OnInit } from "@angular/core";
import { RidesService } from "src/app/shared/rides.service";
import { Rides } from "../../model/ride";
import { FilterUtils } from "primeng/api";

@Component({
  selector: "app-rides-list",
  templateUrl: "./rides-list.component.html",
  styleUrls: ["./rides-list.component.scss"]
})
export class RidesListComponent implements OnInit {
  rides: Rides;
  cols: any[];
  selectedColumns: any[];

  constructor(private ridesService: RidesService) {}

  ngOnInit() {
    this.ridesService.getRides().then((rides: Rides) => {
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
        { field: "prCountWithLink", header: "PR Count" },
        { field: "kudos_count", header: "Kudos" },
        { field: "achievement_count", header: "Achieve" }
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
    if (col === "nameWithLink" || col === "date") return "equals";
    else return "greaterThan";
  }
}
