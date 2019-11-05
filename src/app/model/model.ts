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
  start_date_local: string;
  timezone: string;
  total_elevation_gain: number;
  utc_offset: number;
  weighted_average_watts: number;
  year: string;
}

export interface ISegEffort {
  average_cadence: number;
  average_watts: number;
  device_watts: boolean;
  elapsed_time: number;
  id: number;
  moving_time: number;
  ride_id: number;
  althlete_id: number;
  segment_id: number;
  start_date: string;
  start_date_local: string;
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

export interface ISegPerformance {
  last_ridden_date: string;
  num_times_ridden: number;
  requires_refresh: boolean;
  athlete_id: number;
  segment_id: number;
  segment: ISegment;
  people_above: string;
  people_below: string;
  rank: number;
  pr_date: string;
  pr_date_local: string;
  pr_elapsed_time: number;
  pr_moving_time: number;
  top_date: string;
  top_date_local: string;
  top_elapsed_time: number;
  top_moving_time: number;
  entries: ILeaderboardEntry[];
}

export interface ILeaderboardEntry {
  athlete_name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  rank: number;
}
