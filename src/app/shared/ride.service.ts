import { Injectable } from "@angular/core";
import { Rides } from "../model/ride";
import { IRide } from "../model/model";
import { AngularFirestore } from "@angular/fire/firestore";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class RideService {
  private rides: Rides = null;
  incrementCount: BehaviorSubject<any>;
  propagateMsg: BehaviorSubject<any>;

  constructor(private localDbService: NgxIndexedDBService, private firestore: AngularFirestore) {
    this.incrementCount = new BehaviorSubject(null);
    this.propagateMsg = new BehaviorSubject(null);
    localDbService.currentStore = "ridecache";
  }

  clearLocalDb() {
    this.rides = null;
  }

  get(): Promise<Rides> {
    if (this.rides !== null) return new Promise(resolve => resolve(this.rides));
    return this.localDbService.getByIndex("key", "rides").then(rides => {
      if (rides === undefined) return this.getFromDb();
      else {
        const ridesToReturn: Rides = new Rides(JSON.parse(rides.value)._rides);
        this.rides = ridesToReturn;
        return ridesToReturn;
      }
    });
  }

  private getFromDb(): Promise<Rides> {
    return this.firestore
      .collection("rides", ref => ref.limit(5000))
      .get()
      .toPromise()
      .then(res => {
        console.log("got rides from db");
        const rides = new Rides(res.docs.map(ride => ride.data() as IRide));
        this.localDbService.add({ key: "rides", value: JSON.stringify(rides) });
        this.rides = rides;
        return rides;
      });
  }
}
