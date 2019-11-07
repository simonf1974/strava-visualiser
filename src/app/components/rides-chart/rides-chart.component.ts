import { Component, OnInit, Input } from "@angular/core";
import { ChartModule } from "primeng/chart";
import { RidesService } from "src/app/shared/rides.service";
import { IRide } from "../../model/model";
import { mockRides } from "../../../assets/model/mock-data";

@Component({
  selector: "app-rides-chart",
  templateUrl: "./rides-chart.component.html",
  styleUrls: ["./rides-chart.component.scss"]
})
export class RidesChartComponent implements OnInit {
  data: any;
  options: any;
  rides: IRide[];

  constructor(private ridesService: RidesService) {}

  ngOnInit() {
    this.ridesService.getRides().then((rides: IRide[]) => {
      this.rides = rides;

      const distance = this.rides.map((ride: IRide) => {
        return {
          x: ride.start_date,
          y: ride.distance
        };
      });

      const distAgg = distance.reduce((newArray: any, ride: any, ind: number) => {
        if (ind === 1) newArray = [];
        const date = ride.x.slice(0, 7);
        newArray[date] = (newArray[date] || 0) + ride.y;
        return newArray;
      });

      const distAggData = Object.entries(distAgg).map(item => {
        return {
          x: item[0],
          y: Math.floor(Number(item[1]))
        };
      });

      this.data = {
        // labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
          // {
          //   label: "First Dataset",
          //   data: [65, 59, 80, 81, 56, 55, 40],
          //   fill: false,
          //   borderColor: "red"
          // },
          {
            label: "Second Dataset",
            data: distAggData,
            fill: false,
            borderColor: "blue"
          }
        ]
      };

      this.options = {
        title: {
          display: true,
          text: "My Title",
          fontSize: 16
        },
        legend: {
          position: "bottom"
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ],
          xAxes: [
            {
              type: "time",
              time: {
                unit: "month"
              }
            }
          ]
        }
      };
    });
  }
}
