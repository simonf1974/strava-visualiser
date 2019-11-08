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
            label: "Jan",
            data: distAggData[0],
            // fill: false,
            backgroundColor: "blue",
            borderColor: "blue"
          },
          {
            label: "Feb",
            data: distAggData[1],
            // fill: false,
            backgroundColor: "red",
            borderColor: "red"
          },
          {
            label: "Mar",
            data: distAggData[2],
            // fill: false,
            backgroundColor: "blue",
            borderColor: "blue"
          },
          {
            label: "Apr",
            data: distAggData[3],
            // fill: false,
            backgroundColor: "red",
            borderColor: "red"
          },
          {
            label: "May",
            data: distAggData[4],
            // fill: false,
            backgroundColor: "blue",
            borderColor: "blue"
          },
          {
            label: "Jun",
            data: distAggData[5],
            // fill: false,
            backgroundColor: "red",
            borderColor: "red"
          },
          {
            label: "Jul",
            data: distAggData[6],
            // fill: false,
            backgroundColor: "blue",
            borderColor: "blue"
          },
          {
            label: "Aug",
            data: distAggData[7],
            // fill: false,
            backgroundColor: "red",
            borderColor: "red"
          },
          {
            label: "Sep",
            data: distAggData[8],
            // fill: false,
            backgroundColor: "blue",
            borderColor: "blue"
          },
          {
            label: "Oct",
            data: distAggData[9],
            // fill: false,
            backgroundColor: "red",
            borderColor: "red"
          },
          {
            label: "Nov",
            data: distAggData[10],
            // fill: false,
            backgroundColor: "blue",
            borderColor: "blue"
          },
          {
            label: "Dec",
            data: distAggData[11],
            // fill: false,
            backgroundColor: "red",
            borderColor: "red"
          }
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
