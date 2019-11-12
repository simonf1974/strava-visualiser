import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentSnapshot } from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";
import { firestore, FirebaseError } from "firebase";

@Injectable({
  providedIn: "root"
})
export class DatabaseService {
  incrementCount: BehaviorSubject<any>;
  propagateMsg: BehaviorSubject<any>;
  collections: {
    segmentPerformance: "segment_performance";
  };

  private batches: Map<number, [firestore.WriteBatch, number]> = new Map<
    number,
    [firestore.WriteBatch, number]
  >();

  constructor(private firestore: AngularFirestore) {
    this.incrementCount = new BehaviorSubject(null);
    this.propagateMsg = new BehaviorSubject(null);
  }

  getByKey(collection: string, key: number | number[]): Promise<any> {
    this.incrementCount.next("numDbReadsMade");
    return this.firestore
      .collection(collection)
      .doc(this.transformKeyToStore(key))
      .get()
      .toPromise()
      .then((res: DocumentSnapshot<any>) => {
        this.incrementCount.next("numDbReadsDone");
        return res.data();
      })
      .catch((res: FirebaseError) => {
        this.incrementCount.next("numDbReadsDone");
        this.propagateMsg.next({
          key: "databaseMsg",
          error: `Database error in get by key: Code: ${res.code}, Message: ${res.message}`
        });
        console.log(`Database error: Code: ${res.code}, Message: ${res.message}`);
        return null;
      });
  }

  private transformKeyToStore(key: number | number[]): string {
    if (Array.isArray(key)) {
      let keyToStore: string = "";
      key.forEach(k => {
        keyToStore = keyToStore + "_" + k;
      });
      return keyToStore.substr(1);
    } else return key.toString();
  }

  startBatch(batchId: number): void {
    this.incrementCount.next("numDbWritesMade");
    this.batches.set(batchId, [this.firestore.firestore.batch(), 0]);
  }

  addDataToBatch(collection: string, key: number | number[], data, batchId: number): void {
    const itemRef = this.firestore.collection(collection).doc(this.transformKeyToStore(key)).ref;

    const batch = this.batches.get(batchId)[0];
    let count: number = this.batches.get(batchId)[1];
    this.batches.set(batchId, [batch, ++count]);

    if (this.batches.get(batchId)[1] === 495) {
      this.endBatch(batchId);
      this.startBatch(batchId);
    }
    this.batches.get(batchId)[0].set(itemRef, data, { merge: true });
  }

  endBatch(batchId: number): void {
    console.log(`Ending batch: ${batchId}`);
    const batch = this.batches.get(batchId)[0];

    batch
      .commit()
      .then(res => {
        this.incrementCount.next("numDbWritesDone");
        this.batches.delete(batchId);
      })
      .catch(res => {
        console.log("Error ending batch");
        console.log(res);
      });
  }

  updateData(collection: string, key: number | number[], data): Promise<any> {
    this.incrementCount.next("numDbWritesMade");
    console.log(`Updating this seg perf: ${this.transformKeyToStore(key)}`);
    return new Promise<any>((resolve, reject) => {
      this.firestore
        .collection(collection)
        .doc(this.transformKeyToStore(key))
        .update(data)
        .then(
          res => {
            this.incrementCount.next("numDbWritesDone");
          },
          err => reject(err)
        );
    });
  }
}
