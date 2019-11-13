import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { TableModule } from "primeng/table";
import { MultiSelectModule } from "primeng/multiselect";
import { AngularFontAwesomeModule } from "angular-font-awesome";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { ChartModule } from "primeng/chart";
import { OrganizationChartModule } from "primeng/organizationchart";
import { ProgressBarModule } from "primeng/progressbar";
import { ButtonModule } from "primeng/button";
import { ToolbarModule } from "primeng/toolbar";
import { AccordionModule } from "primeng/accordion";
import { TabViewModule } from "primeng/tabview";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { NgxIndexedDBModule, DBConfig } from "ngx-indexed-db";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { environment } from "src/environments/environment";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { FirestoreCrudComponent } from "./components/firestore-crud/firestore-crud.component";
import { HttpClientModule } from "@angular/common/http";
import { RidesListComponent } from "./components/rides-list/rides-list.component";
import { RidesChartComponent } from "./components/rides-chart/rides-chart.component";
import { SegPerfListComponent } from "./components/seg-perf-list/seg-perf-list.component";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { SegEffortsListComponent } from "./components/seg-efforts-list/seg-efforts-list.component";
import { SegPerfChartComponent } from "./components/seg-perf-chart/seg-perf-chart.component";
import { RidesListContainerComponent } from './components/rides-list-container/rides-list-container.component';

const dbConfig: DBConfig = {
  name: "MyDb",
  version: 1,
  objectStoresMeta: [
    {
      store: "ridecache",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "key", keypath: "key", options: { unique: true } },
        { name: "value", keypath: "value", options: { unique: false } }
      ]
    }
  ]
};

@NgModule({
  declarations: [
    AppComponent,
    FirestoreCrudComponent,
    RidesListComponent,
    RidesChartComponent,
    SegPerfListComponent,
    NavBarComponent,
    SegEffortsListComponent,
    SegPerfChartComponent,
    RidesListContainerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    TableModule,
    MultiSelectModule,
    AngularFontAwesomeModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    ChartModule,
    OrganizationChartModule,
    ProgressBarModule,
    ButtonModule,
    ToolbarModule,
    AccordionModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    TabViewModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
