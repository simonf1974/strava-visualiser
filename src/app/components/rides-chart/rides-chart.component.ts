import { Component, OnInit, Input } from "@angular/core";
import { ChartModule } from "primeng/chart";
import { RidesService } from "src/app/shared/rides.service";
import { IRide } from "../../model/model";
import { Rides } from "src/app/model/ride";

@Component({
  selector: "app-rides-chart",
  templateUrl: "./rides-chart.component.html",
  styleUrls: ["./rides-chart.component.scss"]
})
export class RidesChartComponent implements OnInit {
  data: any;
  options: any;
  rides: Rides;

  constructor(private ridesService: RidesService) {}

  ngOnInit() {
    this.ridesService.getRides().then((rides: Rides) => {
      this.rides = rides;

      const distAggData = this.rides.getRidesByMonth();

      this.data = {
        // labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
          {
            label: "Monthly Distances",
            data: distAggData,
            // fill: false,
            backgroundColor: "blue",
            borderColor: "blue"
          }
          // {
          //   label: "First Dataset",
          //   data: distAggData2,
          //   // fill: false,
          //   backgroundColor: "red",
          //   borderColor: "red"
          // },
          // {
          //   label: "First Dataset",
          //   data: distAggData3,
          //   // fill: false,
          //   backgroundColor: "green",
          //   borderColor: "green"
          // }
        ]
      };

      this.options = {
        title: {
          display: true,
          text: "Ride Distances by Month",
          fontSize: 16
        },
        legend: {
          position: "bottom"
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                callback: function(label, index, labels) {
                  return label.toLocaleString() + " km";
                }
              },
              stacked: true
            }
          ],
          xAxes: [
            {
              type: "time",
              time: {
                unit: "year"
              },
              stacked: true,
              offset: true
            }
          ]
        }
      };
    });
  }
}
