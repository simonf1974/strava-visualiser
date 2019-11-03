import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RidesService, IRide } from "src/app/shared/rides.service";
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
  rides: IRide[];
  cols: any[];
  selectedColumns: any[];
  years: any[];
  months: any[];

  constructor(private ridesService: RidesService) {}

  ngOnInit() {
    this.ridesService.getRides().then((rides: IRide[]) => {
      this.rides = rides;
      this.cols = [
        { field: "year", header: "Year" },
        { field: "month", header: "Month" },
        { field: "start_date_local", header: "Date" },
        { field: "name", header: "Name" },
        { field: "distance", header: "Distance" },
        { field: "elapsed_time", header: "Time" }
      ];

      this.selectedColumns = this.cols;

      // this.years = this.rides.map(ride => {
      //   return { label: "Year", value: ride.year };
      // });

      this.years = [
        { label: "2018", value: "2018" },
        { label: "2019", value: "2019" }
      ];

      this.months = [
        { label: "All Months", value: null },
        { label: "January", value: "01" },
        { label: "February", value: "02" },
        { label: "March", value: "03" },
        { label: "April", value: "04" },
        { label: "May", value: "05" },
        { label: "June", value: "06" },
        { label: "July", value: "07" },
        { label: "August", value: "08" },
        { label: "September", value: "09" },
        { label: "October", value: "10" },
        { label: "November", value: "11" },
        { label: "December", value: "12" }
      ];

      FilterUtils["greaterThan"] = (value, filter): boolean => {
        if (filter === undefined || filter === null || filter.trim() === "") {
          return true;
        }

        if (value === undefined || value === null) {
          return false;
        }

        return parseInt(filter) < value;
      };
    });
  }
}
