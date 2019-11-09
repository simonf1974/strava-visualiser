import { ILeaderboardEntry, ISegment, ISegPerformance } from "./model";

export class SegmentPerformances {
  private _segmentPerformances: SegmentPerformance[];

  constructor(segmentPerformances: ISegPerformance[]) {
    this._segmentPerformances = [];
    segmentPerformances.forEach(segmentPerformance => {
      this._segmentPerformances.push(Object.assign(new SegmentPerformance(), segmentPerformance));
    });
  }

  get segmentPerformances(): SegmentPerformance[] {
    return this._segmentPerformances;
  }

  getSegmentEffortWithPerformance(segmentEfforts: SegmentEffort[]) {
    return segmentEfforts.map(segEffort => {
      segEffort.segmentPerformance = this.segmentPerformances.find(
        segPerf => segEffort.segment_id === segPerf.segment_id
      );
      return segEffort;
    });
  }
}

export class SegmentPerformance {
  num_times_ridden: number;
  requires_refresh: boolean;
  athlete_id: number;
  segment_id: number;
  people_above: string;
  people_below: string;
  rank: number;
  num_entries: number;
  pr_date: string;
  pr_elapsed_time: number;
  pr_moving_time: number;
  top_date: string;
  top_elapsed_time: number;
  top_moving_time: number;
  entries: ILeaderboardEntry[];
  segment: ISegment;

  get segment_name_with_link() {
    return `<span><a href='https://www.strava.com/segments/${this.segment.id}' target='_blank'>${this.segment.name}</a></span>`;
  }

  get segment_city() {
    return this.segment.city;
  }

  get segment_average_grade() {
    return this.segment.average_grade;
  }
}

export class SegmentEffort {
  average_cadence: number;
  average_watts: number;
  device_watts: boolean;
  elapsed_time: number;
  id: number;
  moving_time: number;
  segment_id: number;
  start_date: string;
  segment: ISegment;
  segmentPerformance: SegmentPerformance;
}
