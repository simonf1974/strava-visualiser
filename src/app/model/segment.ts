import { ILeaderboardEntry, ISegment, ISegPerformance, ISegEffort, IChartPoint } from "./model";

export class SegmentPerformances {
  private _segmentPerformances: SegmentPerformance[];

  constructor(
    segmentPerformancesRiddenByFriends: ISegPerformance[],
    segmentPerformancesRiddenMost: ISegPerformance[]
  ) {
    this._segmentPerformances = [];
    segmentPerformancesRiddenByFriends.forEach(segmentPerformance => {
      this._segmentPerformances.push(Object.assign(new SegmentPerformance(), segmentPerformance));
    });
    if (segmentPerformancesRiddenMost !== null) {
      segmentPerformancesRiddenMost.forEach(segmentPerformance => {
        if (segmentPerformance.entries.length === 1) {
          this._segmentPerformances.push(
            Object.assign(new SegmentPerformance(), segmentPerformance)
          );
        }
      });
    }
  }

  get segmentPerformances(): SegmentPerformance[] {
    return this._segmentPerformances;
  }

  getSegmentEffortWithPerformance(segmentEfforts: ISegEffort[]): SegmentEffort[] {
    return segmentEfforts
      .map(segEffort => {
        const segEffortObj: SegmentEffort = Object.assign(new SegmentEffort(), segEffort);
        segEffortObj.segmentPerformance = this.segmentPerformances.find(
          segPerf => segEffort.segment_id === segPerf.segment_id
        );
        return segEffortObj;
      })
      .filter(segEffort => segEffort.segmentPerformance !== undefined);
  }

  getSegPerfForScatter(rank?: number): IChartPoint[] {
    return this.segmentPerformances
      .filter((segPerf: SegmentPerformance) => {
        if (rank !== undefined && rank !== segPerf.rank) return false;
        if (rank === undefined && segPerf.rank < 4) return false;

        return (
          segPerf.segment_distance > 0.8 && segPerf.num_times_ridden > 1 && segPerf.num_entries > 2
        );
      })
      .map((segPerf: SegmentPerformance) => {
        return {
          x: segPerf.num_times_ridden,
          y: segPerf.segment.average_grade,
          r: segPerf.num_entries,
          segmentId: segPerf.segment_id,
          segmentName: segPerf.segment.name,
          segmentRank: `${segPerf.rank} / ${segPerf.num_entries}`
        };
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

  get segment_name() {
    return this.segment.name;
  }

  get segment_name_with_link() {
    return `<span><a href='https://www.strava.com/segments/${this.segment.id}' target='_blank'>${this.segment.name}</a></span>`;
  }

  get segment_city() {
    return this.segment.city;
  }

  get segment_average_grade() {
    return Math.floor(this.segment.average_grade);
  }

  get segment_distance() {
    return Math.floor((this.segment.distance / 1000) * 10) / 10;
  }

  get secondsPrBehindTop() {
    return formatTime(this.pr_elapsed_time - this.top_elapsed_time);
  }

  get prDate() {
    return this.pr_date.slice(0, 10);
  }

  get topDate() {
    return this.top_date.slice(0, 10);
  }

  get prElapsedTime() {
    return formatTime(this.pr_elapsed_time);
  }

  get topElapsedTime() {
    return formatTime(this.top_elapsed_time);
  }
}

const formatTime = (secsToConvert: number): string => {
  const dateObj = new Date(secsToConvert * 1000);
  const hours = dateObj.getUTCHours();
  const minutes = dateObj.getUTCMinutes();
  const secs = dateObj.getUTCSeconds();

  const timeString = `${
    hours !== 0 ? hours.toString().padStart(2, "0") + ":  " : ""
  }${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return timeString;
};

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

  get secondsPrBehindTop() {
    return this.segmentPerformance.secondsPrBehindTop;
  }

  get secondsBehindPr() {
    return formatTime(this.elapsed_time - this.segmentPerformance.pr_elapsed_time);
  }

  get pr_date() {
    return this.segmentPerformance.prDate;
  }

  get top_date() {
    return this.segmentPerformance.topDate;
  }

  get segment_distance() {
    return Math.floor((this.segment.distance / 1000) * 10) / 10;
  }

  get pr_elapsed_time() {
    return this.segmentPerformance.prElapsedTime;
  }

  get top_elapsed_time() {
    return this.segmentPerformance.topElapsedTime;
  }

  get segment_name_with_link() {
    return `<span><a href='https://www.strava.com/segments/${this.segment.id}' target='_blank'>${this.segment.name}</a></span>`;
  }

  get elapsedTime() {
    return formatTime(this.elapsed_time);
  }

  get avgWatts() {
    return Math.floor(this.average_watts);
  }

  get avgCadence() {
    return Math.floor(this.average_cadence);
  }

  get startTime() {
    return this.start_date.slice(11, 19);
  }

  get segment_city() {
    return this.segment.city;
  }

  get segment_average_grade() {
    return Math.floor(this.segment.average_grade);
  }

  get num_times_ridden() {
    return this.segmentPerformance.num_times_ridden;
  }

  get rank() {
    return this.segmentPerformance.rank;
  }

  get people_above() {
    return this.segmentPerformance.people_above;
  }

  get people_below() {
    return this.segmentPerformance.people_below;
  }
}
