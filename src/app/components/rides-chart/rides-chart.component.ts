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
    this.getRides();
    this.initChartOptions();
  }

  initChartOptions() {
    this.options = {
      title: {
        display: true,
        text: "Cycing Activity by Year",
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
            stacked: true,
            position: "right",
            id: "km",
            scaleLabel: {
              display: true,
              labelString: "Total Distance (km)"
            }
          },
          {
            ticks: {
              callback: function(label, index, labels) {
                return label + " kph";
              }
            },
            position: "left",
            id: "kph",
            scaleLabel: {
              display: true,
              labelString: "Average Speed (kph)"
            }
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
  }

  getRides() {
    this.ridesService.getRides().then((rides: Rides) => {
      this.rides = rides;

      const distAggData = this.rides.getRidesByMonth();
      const avgSpeedByYear = this.rides.getRideAvgSpeedByYear();

      this.data = {
        datasets: [
          {
            label: "Avg Sp.",
            data: avgSpeedByYear,
            borderColor: "black",
            type: "line",
            yAxisID: "kph",
            fill: false
          },
          {
            label: "Jan",
            data: distAggData[0],
            backgroundColor: "rgba(64, 156, 255)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Feb",
            data: distAggData[1],
            backgroundColor: "rgba(153, 204, 255)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Mar",
            data: distAggData[2],
            backgroundColor: "rgba(204, 229, 255)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Apr",
            data: distAggData[3],
            backgroundColor: "rgba(255, 229, 204)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "May",
            data: distAggData[4],
            backgroundColor: "rgba(255, 204, 153)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Jun",
            data: distAggData[5],
            backgroundColor: "rgba(255, 178, 102)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Jul",
            data: distAggData[6],
            backgroundColor: "rgba(255, 153, 51)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Aug",
            data: distAggData[7],
            backgroundColor: "rgba(255, 128, 0)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Sep",
            data: distAggData[8],
            backgroundColor: "rgba(255, 178, 102)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Oct",
            data: distAggData[9],
            backgroundColor: "rgba(204, 229, 255)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Nov",
            data: distAggData[10],
            backgroundColor: "rgba(153, 204, 255)",
            borderColor: "black",
            yAxisID: "km"
          },
          {
            label: "Dec",
            data: distAggData[11],
            backgroundColor: "rgba(64, 156, 255)",
            borderColor: "black",
            yAxisID: "km"
          }
        ]
      };
    });
  }
}
