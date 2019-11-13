import { Injectable } from "@angular/core";
import { Rides } from "../model/ride";
import { IRide, localDb, collections } from "../model/model";
import { AngularFirestore } from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";
import { LocaldbService } from "./localdb.service";

@Injectable({
  providedIn: "root"
})
export class RideService {
  private rides: Rides = null;
  incrementCount: BehaviorSubject<any>;
  propagateMsg: BehaviorSubject<any>;

  constructor(private localDbService: LocaldbService, private firestore: AngularFirestore) {
    this.incrementCount = new BehaviorSubject(null);
    this.propagateMsg = new BehaviorSubject(null);
  }

  clearLocalDb() {
    this.rides = null;
  }

  get(): Promise<Rides> {
    if (this.rides !== null) return new Promise(resolve => resolve(this.rides));
    return this.localDbService.get(localDb.rides).then(rides => {
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
      .collection(collections.rides, ref => ref.limit(5000))
      .get()
      .toPromise()
      .then(res => {
        const rides = new Rides(res.docs.map(ride => ride.data() as IRide));
        this.localDbService.add(localDb.rides, JSON.stringify(rides));
        this.rides = rides;
        return rides;
      });
  }
}
