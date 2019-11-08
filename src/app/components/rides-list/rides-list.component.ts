import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RidesService } from "src/app/shared/rides.service";
import { Ride, Rides } from "../../model/ride";
import { TableModule } from "primeng/table";
import { MultiSelectModule } from "primeng/multiselect";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
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
      // console.log(JSON.stringify(rides));

      // const r: Ride = Object.assign(new Ride(), rides[0]);
      // const r2: Ride = Object.assign(new Ride(), rides[1]);

      // const ra: Ride[] = Object.assign(new Ride(), rides);
      // console.log(ra);
      // console.log(ra[0]);

      // console.log(r.getYearTimesTwo());

      // const rs = JSON.stringify([r, r2]);

      // console.log(rs);

      // console.log(rides.rides);

      this.rides = rides;
      this.cols = [
        { field: "year", header: "Year" },
        { field: "month", header: "Month" },
        { field: "start_date", header: "Date" },
        { field: "name", header: "Name" },
        { field: "distance", header: "Distance (km)" },
        { field: "moving_time", header: "Time (hrs)" },
        { field: "average_speed", header: "Avg Speed (kph)" }
      ];
      this.selectedColumns = this.cols;
      FilterUtils["greaterThan"] = (value, filter): boolean => {
        if (filter === undefined || filter === null || filter.trim() === "") return true;
        if (value === undefined || value === null) return false;
        return parseInt(filter) < value;
      };
    });
  }
}
