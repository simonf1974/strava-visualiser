import { Component, OnInit, Input } from "@angular/core";
import { ChartModule } from "primeng/chart";
import { RidesService } from "src/app/shared/rides.service";
import { IRide } from "../../model/model";

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
        if (newArray[date] === undefined) newArray[date] = [0, 0];
        newArray[date][0] = (newArray[date][0] || 0) + ride.y;
        newArray[date][1] = (newArray[date][1] || 0) + 2;

        return newArray;
      });

      console.log(distAgg);

      const distAggData = Object.entries(distAgg).map(item => {
        console.log(item);
        return {
          x: item[0],
          y: Math.floor(Number(item[1][0])),
          r: 6
        };
      });

      console.log(distAggData);

      const distAggData2 = Object.entries(distAgg).map(item => {
        return {
          x: item[0],
          y: Math.floor(Number(item[1]) * 1.2)
        };
      });

      const distAggData3 = Object.entries(distAgg).map(item => {
        return {
          x: item[0],
          y: Math.floor(Number(item[1]) * 1.3)
        };
      });

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
