import { Injectable } from "@angular/core";
import { DatabaseService } from "./database.service";
import { SegmentPerformances, SegmentEffort } from "../model/segment";
import {
  ISegEffort,
  ISegPerformance,
  collections,
  localDb,
  columns,
  ISegPerfPreUpdate
} from "../model/model";
import { CollectionReference, AngularFirestore } from "@angular/fire/firestore";
import { Observable, BehaviorSubject } from "rxjs";
import { LocaldbService } from "./localdb.service";

@Injectable({
  providedIn: "root"
})
export class SegmentService {
  private segPerfs: SegmentPerformances = null;
  incrementCount: BehaviorSubject<any>;
  propagateMsg: BehaviorSubject<any>;

  constructor(
    private remoteDbService: DatabaseService,
    private localDbService: LocaldbService,
    private firestore: AngularFirestore
  ) {
    this.incrementCount = new BehaviorSubject(null);
    this.propagateMsg = new BehaviorSubject(null);
  }

  clearLocalDb() {
    this.segPerfs = null;
  }

  getRideSegments(rideId: number): Promise<SegmentEffort[]> {
    return this.get().then((segPerfs: SegmentPerformances) => {
      return this.localDbService.get(rideId).then(seFromLocalDb => {
        if (seFromLocalDb === undefined)
          return this.getRideSegmentsFromDb(rideId).then((seFromDb: ISegEffort[]) =>
            segPerfs.getSegmentEffortWithPerformance(seFromDb)
          );
        else
          return segPerfs.getSegmentEffortWithPerformance(
            JSON.parse(seFromLocalDb.value).seg_efforts
          );
      });
    });
  }

  private getRideSegmentsFromDb(rideId: number): Promise<ISegEffort[]> {
    return this.remoteDbService.get(collections.rideSegEfforts, rideId).then(segEfforts => {
      this.localDbService.add(rideId, JSON.stringify(segEfforts));
      return segEfforts.seg_efforts;
    });
  }

  get(): Promise<SegmentPerformances> {
    if (this.segPerfs !== null) return new Promise(resolve => resolve(this.segPerfs));
    return this.localDbService.get(localDb.segPerfs).then(segPerfs => {
      if (segPerfs === undefined) return this.getFromDb();
      else {
        const segPerfsToReturn: SegmentPerformances = new SegmentPerformances(
          JSON.parse(segPerfs.value)._segmentPerformances,
          null
        );
        this.segPerfs = segPerfsToReturn;
        return segPerfsToReturn;
      }
    });
  }

  private getFromDb(): Promise<SegmentPerformances> {
    return this.firestore
      .collection(collections.segmentPerformance, (ref: CollectionReference) =>
        ref
          .where(columns.numEntries, ">", 1)
          .orderBy(columns.numEntries, "desc")
          .orderBy(columns.numTimesRidden, "desc")
          .limit(10000)
      )
      .get()
      .toPromise()
      .then(res => {
        const segPerfsNumEntries = res.docs.map(segPerf => segPerf.data() as ISegPerformance);
        return this.getRiddenMostFromDb(segPerfsNumEntries);
      });
  }

  private getRiddenMostFromDb(segPerfsNumEntries: ISegPerformance[]): Promise<SegmentPerformances> {
    return this.firestore
      .collection(collections.segmentPerformance, (ref: CollectionReference) =>
        ref
          .where(columns.numTimesRidden, ">", 1)
          .orderBy(columns.numTimesRidden, "desc")
          .limit(10000)
      )
      .get()
      .toPromise()
      .then(res => {
        const segPerfs = new SegmentPerformances(
          segPerfsNumEntries,
          res.docs.map(segPerf => segPerf.data() as ISegPerformance)
        );
        this.localDbService.add(localDb.segPerfs, JSON.stringify(segPerfs));
        this.segPerfs = segPerfs;
        return segPerfs;
      });
  }

  getRequiringRefresh(): Observable<any> {
    this.incrementCount.next("numDbReadsMade");
    return this.firestore
      .collection(collections.segmentPerformance, (ref: CollectionReference) =>
        ref.where(columns.requiresRefresh, "==", true).limit(10)
      )
      .valueChanges();
  }

  updateWithLeaderboard(segPerformance: ISegPerformance, leaderboard: ISegPerfPreUpdate): void {
    this.remoteDbService.update(
      collections.segmentPerformance,
      [segPerformance.segment_id, segPerformance.athlete_id],
      leaderboard
    );
  }
}
