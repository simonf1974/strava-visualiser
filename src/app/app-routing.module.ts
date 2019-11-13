import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FirestoreCrudComponent } from "./components/firestore-crud/firestore-crud.component";
import { RidesChartComponent } from "./components/rides-chart/rides-chart.component";
import { SegPerfListComponent } from "./components/seg-perf-list/seg-perf-list.component";
import { SegPerfChartComponent } from "./components/seg-perf-chart/seg-perf-chart.component";
import { RidesListContainerComponent } from "./components/rides-list-container/rides-list-container.component";

const routes: Routes = [
  { path: "strava-scrape", component: FirestoreCrudComponent },
  { path: "rides-chart", component: RidesChartComponent },
  { path: "seg-perf-chart", component: SegPerfChartComponent },
  { path: "rides-list-container", component: RidesListContainerComponent },
  { path: "seg-perf-list", component: SegPerfListComponent },
  { path: "", redirectTo: "/rides-chart", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
