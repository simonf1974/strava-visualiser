import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { GraphComponent } from "./components/graph/graph.component";

import { RidesService } from "./shared/rides.service";

import { environment } from "src/environments/environment";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { FirestoreCrudComponent } from './components/firestore-crud/firestore-crud.component';

@NgModule({
  declarations: [AppComponent, GraphComponent, FirestoreCrudComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule
  ],
  providers: [RidesService],
  bootstrap: [AppComponent]
})
export class AppModule {}
