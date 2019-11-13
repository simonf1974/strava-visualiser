import { Component, OnInit } from "@angular/core";
import { SegmentPerformances } from "src/app/model/segment";
import { SegmentService } from "src/app/shared/segment.service";

@Component({
  selector: "app-seg-perf-chart",
  templateUrl: "./seg-perf-chart.component.html",
  styleUrls: ["./seg-perf-chart.component.scss"]
})
export class SegPerfChartComponent implements OnInit {
  data: any;
  options: any;
  segPerfs: SegmentPerformances;

  constructor(private segmentService: SegmentService) {}

  ngOnInit() {
    this.getSegPerfs();
    this.initChartOptions();
  }

  initChartOptions() {
    this.options = {
      title: {
        display: true,
        text: "Segment Analysis",
        fontSize: 16
      },

      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const myData = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return [
              myData.segmentName,
              `Num Times Ridden: ${myData.x}`,
              `Segment Rank: ${myData.segmentRank}`,
              `Avg Grade: ${Math.floor(myData.y)}%`
            ];
          }
        }
      },

      onClick: function(c, i) {
        const e = i[0];
        var y_value = this.data.datasets[e._datasetIndex].data[e._index];
        window.open(`https://www.strava.com/segments/${y_value.segmentId}`, "_blank");
      },

      legend: {
        position: "top"
      },
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Average Grade of Segment (%)"
            }
          }
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Number of Times Segment Ridden"
            }
          }
        ]
      }
    };
  }

  getSegPerfs() {
    this.segmentService.get().then((segPerfs: SegmentPerformances) => {
      this.segPerfs = segPerfs;
      this.data = {
        datasets: [
          {
            label: "Rank: 1st",
            data: segPerfs.getSegPerfForScatter(1),
            borderColor: "rgba(255, 0, 0, 0.3)",
            backgroundColor: "rgba(255, 0, 0, 0.2)"
          },
          {
            label: "Rank: 2nd",
            data: segPerfs.getSegPerfForScatter(2),
            borderColor: "rgba(0, 0, 255, 0.3)",
            backgroundColor: "rgba(0, 0, 255, 0.1)"
          },
          {
            label: "Rank: 3rd",
            data: segPerfs.getSegPerfForScatter(3),
            borderColor: "rgba(0, 255, 0, 0.3)",
            backgroundColor: "rgba(0, 255, 0, 0.1)"
          },
          {
            label: "Rank: 4th+",
            data: segPerfs.getSegPerfForScatter(),
            borderColor: "rgba(64, 64, 64, 0.3)",
            backgroundColor: "rgba(64, 64, 64, 0.1)"
          }
        ]
      };
    });
  }
}
