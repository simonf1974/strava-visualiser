import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { TableModule } from "primeng/table";
import { MultiSelectModule } from "primeng/multiselect";
import { AngularFontAwesomeModule } from "angular-font-awesome";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { GraphComponent } from "./components/graph/graph.component";

import { RidesService } from "./shared/rides.service";

import { environment } from "src/environments/environment";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { FirestoreCrudComponent } from "./components/firestore-crud/firestore-crud.component";
import { HttpClientModule } from "@angular/common/http";
import { RidesListComponent } from "./components/rides-list/rides-list.component";

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    FirestoreCrudComponent,
    RidesListComponent
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
    FormsModule
  ],
  providers: [RidesService],
  bootstrap: [AppComponent]
})
export class AppModule {}
