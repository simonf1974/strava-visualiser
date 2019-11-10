import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FirestoreCrudComponent } from "./components/firestore-crud/firestore-crud.component";
import { RidesChartComponent } from "./components/rides-chart/rides-chart.component";
import { RidesListComponent } from "./components/rides-list/rides-list.component";
import { SegPerfListComponent } from "./components/seg-perf-list/seg-perf-list.component";
import { SegEffortsListComponent } from "./components/seg-efforts-list/seg-efforts-list.component";

const routes: Routes = [
  { path: "strava-scrape", component: FirestoreCrudComponent },
  { path: "rides-chart", component: RidesChartComponent },
  { path: "rides-list", component: RidesListComponent },
  { path: "seg-perf-list", component: SegPerfListComponent },
  { path: "seg-efforts-list/:id", component: SegEffortsListComponent },
  { path: "", redirectTo: "/rides-chart", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
