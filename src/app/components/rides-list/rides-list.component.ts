import { Component, OnInit } from "@angular/core";
import { RidesService, IRide } from "src/app/shared/rides.service";
import { TableModule } from "primeng/table";
import { MultiSelectModule } from "primeng/multiselect";

@Component({
  selector: "app-rides-list",
  templateUrl: "./rides-list.component.html",
  styleUrls: ["./rides-list.component.scss"]
})
export class RidesListComponent implements OnInit {
  rides: IRide[];
  cols: any[];
  years: any[];

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

      // this.years = this.rides.map(ride => {
      //   return { label: "Year", value: ride.year };
      // });

      this.years = [
        { label: "2018", value: "2018" },
        { label: "2019", value: "2019" }
      ];

      console.log(this.years);
    });
  }
}
