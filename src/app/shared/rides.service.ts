import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class RidesService {
  constructor(private firestore: AngularFirestore) {}

  addData(collection, key, data) {
    console.log("hello");
    return new Promise<any>((resolve, reject) => {
      this.firestore
        .collection(collection)
        .doc(key)
        .set(data)
        .then(res => {}, err => reject(err));
    });
  }

  getData() {
    // return this.firestore.collection("rides").snapshotChanges();

    return this.firestore
      .collection("rides", ref => ref.where("athleteid", "==", "1253381"))
      .snapshotChanges();
  }
}
