import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FirestoreCrudComponent } from "./components/firestore-crud/firestore-crud.component";
import { RidesChartComponent } from "./components/rides-chart/rides-chart.component";
import { RidesListComponent } from "./components/rides-list/rides-list.component";
import { SegPerfListComponent } from "./components/seg-perf-list/seg-perf-list.component";
import { SegPerfChartComponent } from "./components/seg-perf-chart/seg-perf-chart.component";

const routes: Routes = [
  { path: "strava-scrape", component: FirestoreCrudComponent },
  { path: "rides-chart", component: RidesChartComponent },
  { path: "seg-perf-chart", component: SegPerfChartComponent },
  { path: "rides-list", component: RidesListComponent },
  { path: "seg-perf-list", component: SegPerfListComponent },
  { path: "", redirectTo: "/rides-chart", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
