import { Component, OnInit } from "@angular/core";
import { Chart } from "chart.js";

@Component({
  selector: "app-graph",
  templateUrl: "./graph.component.html",
  styleUrls: ["./graph.component.scss"]
})
export class GraphComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    this.initGraph();
  }

  initGraph() {
    var canvas = <HTMLCanvasElement>document.getElementById("myChart");
    var ctx = canvas.getContext("2d");

    // const ctx = "myChart";

    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
          {
            label: "A",
            yAxisID: "A",
            data: [
              {
                x: Date.parse("04 Dec 2018"),
                y: 1
              },

              {
                x: Date.parse("04 Jan 2019"),
                y: 5
              },

              {
                x: Date.parse("15 Jan 2019"),
                y: 5
              },
              {
                x: Date.parse("25 Feb 2019"),
                y: 19
              }
            ],
            fill: false,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)"
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)"
            ],
            borderWidth: 1
          },
          {
            label: "B",
            yAxisID: "B",
            data: [
              {
                x: Date.parse("04 Dec 2018"),
                y: 22
              },

              {
                x: Date.parse("04 Jan 2019"),
                y: 18
              },
              {
                x: Date.parse("15 Jan 2019"),
                y: 21
              },
              {
                x: Date.parse("25 Feb 2019"),
                y: 29
              }
            ],
            type: "line",

            fill: false,

            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)"
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)"
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          // yAxes: [
          //   {
          //     ticks: {
          //       beginAtZero: true
          //     }
          //   }
          // ],

          yAxes: [
            {
              id: "A",
              type: "linear",
              position: "left",
              // offset: true,
              ticks: {
                beginAtZero: true
              }
            },
            {
              id: "B",
              type: "linear",
              position: "right",
              // offset: true,

              ticks: {
                beginAtZero: true
              }
            }
          ],

          xAxes: [
            {
              type: "time",
              offset: true,

              time: {
                unit: "month"
              }
            }
          ]
        }
      }
    });

    console.log(myChart);
  }
}
