import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RidesService } from "src/app/shared/rides.service";
import { ISegPerformance } from "../../model/model";
import { TableModule } from "primeng/table";
import { MultiSelectModule } from "primeng/multiselect";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { FilterUtils } from "primeng/api";
import * as _ from "lodash";

@Component({
  selector: "app-seg-perf-list",
  templateUrl: "./seg-perf-list.component.html",
  styleUrls: ["./seg-perf-list.component.scss"]
})
export class SegPerfListComponent implements OnInit {
  segPerfs: ISegPerformance[];
  cols: any[];
  selectedColumns: any[];

  constructor(private ridesService: RidesService) {}

  ngOnInit() {
    this.ridesService.getSegPerformances().then((segPerfs: ISegPerformance[]) => {
      this.segPerfs = segPerfs;
      this.cols = [
        { field: "segment.name", header: "Name" },
        { field: "segment.city", header: "City" },
        { field: "num_times_ridden", header: "Times Ridden" },
        { field: "rank", header: "Rank" },
        { field: "segment.average_grade", header: "Avg Grade" },
        { field: "people_above", header: "People Above" },
        { field: "people_below", header: "People Below" },
        { field: "pr_date", header: "PR Date" },
        { field: "pr_elapsed_time", header: "PR Time (s)" },
        { field: "top_date", header: "Top Date" },
        { field: "top_elapsed_time", header: "Top Time (s)" }
      ];
      this.selectedColumns = this.cols;
      FilterUtils["greaterThan"] = (value, filter): boolean => {
        if (filter === undefined || filter === null || filter.trim() === "") return true;
        if (value === undefined || value === null) return false;
        return parseInt(filter) < value;
      };
    });
  }

  getField(field: string) {
    console.log(_.get(this.cols, field));
    return _.get(this.cols, field);
  }
}
