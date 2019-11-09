import * as FileSaver from "file-saver";

export interface IRideDetails {
  ride: IRide;
  segEfforts: ISegEffort[];
}

export interface IRide {
  achievement_count: number;
  athlete_count: number;
  athlete_id: number;
  average_cadence: number;
  average_speed: number;
  average_temp: number;
  average_watts: number;
  calories: number;
  comment_count: number;
  device_watts: boolean;
  distance: number;
  elapsed_time: number;
  elev_high: number;
  elev_low: number;
  has_heartrate: boolean;
  id: number;
  kudos_count: number;
  max_speed: number;
  max_watts: number;
  month: string;
  moving_time: number;
  name: string;
  pr_count: number;
  start_date: string;
  total_elevation_gain: number;
  weighted_average_watts: number;
  year: number;
}

export interface ISegEffort {
  average_cadence: number;
  average_watts: number;
  device_watts: boolean;
  elapsed_time: number;
  id: number;
  moving_time: number;
  segment_id: number;
  start_date: string;
  segment: ISegment;
}

export interface ISegment {
  average_grade: number;
  city: string;
  climb_category: number;
  country: string;
  distance: number;
  elevation_high: number;
  elevation_low: number;
  id: number;
  maximum_grade: number;
  name: string;
  state: string;
}

export interface ISegPerfPreSave {
  requires_refresh: boolean;
  athlete_id: number;
  segment_id: number;
  segment: ISegment;
}

export interface ISegPerfPreUpdate {
  requires_refresh: boolean;
  people_above: string;
  people_below: string;
  rank: number;
  num_times_ridden: number;
  num_entries: number;
  pr_date: string;
  pr_elapsed_time: number;
  pr_moving_time: number;
  top_date: string;
  top_elapsed_time: number;
  top_moving_time: number;
  entries: ILeaderboardEntry[];
}

export interface ISegPerformance {
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
}

export interface ILeaderboardEntry {
  athlete_name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  rank: number;
}

export interface IChartPoint {
  x: string;
  y: number;
  r?: number;
}

const maxLocalStorageLength = 900000;

export const saveToLocalStorage = (objToSave, name: string) => {
  const objString = JSON.stringify(objToSave);
  const pages = Math.floor(objString.length / maxLocalStorageLength) + 1;
  const objStringPaged: string[] = [];

  for (let i = 0; i < pages; i++) {
    let startPos = 0;
    if (i > 0) startPos = maxLocalStorageLength * i;
    objStringPaged.push(objString.slice(startPos, (i + 1) * maxLocalStorageLength));
  }

  objStringPaged.forEach((str: string, ind: number) => localStorage.setItem(`${name}${ind}`, str));
};

export const getFromLocalStorage = (name: string) => {
  const blob = new Blob(["Hello, world!"], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, "simonhelloworld.txt");

  console.log(blob);

  let moreToGet = true;
  let page = 0;
  let objStringPaged: string[] = [];

  while (moreToGet) {
    const str = localStorage.getItem(`${name}${page}`);
    if (str !== null) {
      objStringPaged.push(str);
      moreToGet = str.length === maxLocalStorageLength;
    } else moreToGet = false;
  }
  if (objStringPaged.length === 0) return null;
  else return JSON.parse(objStringPaged.join(""));
};
