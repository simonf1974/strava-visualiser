import { IRide, IChartsPoint } from "./model";

export class Rides {
  private _rides: Ride[];

  constructor(rides: IRide[]) {
    this._rides = [];
    rides.forEach(ride => this._rides.push(Object.assign(new Ride(), ride)));
  }

  get rides(): Ride[] {
    return this._rides;
  }

  getRidesByMonth(): IChartsPoint[] {
    const distance = this.rides.map((ride: IRide) => {
      return {
        x: ride.start_date,
        y: ride.distance
      };
    });

    const distAgg = distance.reduce((newArray: any, ride: any, ind: number) => {
      if (ind === 1) newArray = [];
      const date = ride.x.slice(0, 7);
      if (newArray[date] === undefined) newArray[date] = [0, 0];
      newArray[date][0] = (newArray[date][0] || 0) + ride.y;
      newArray[date][1] = (newArray[date][1] || 0) + 2;

      return newArray;
    });

    // console.log(distAgg);

    const distAggData = Object.entries(distAgg).map(item => {
      // console.log(item);
      return {
        x: item[0],
        y: Math.floor(Number(item[1][0]))
        // r: 6
      };
    });

    return distAggData;

    // console.log(distAggData);

    // const distAggData2 = Object.entries(distAgg).map(item => {
    //   return {
    //     x: item[0],
    //     y: Math.floor(Number(item[1]) * 1.2)
    //   };
    // });

    // const distAggData3 = Object.entries(distAgg).map(item => {
    //   return {
    //     x: item[0],
    //     y: Math.floor(Number(item[1]) * 1.3)
    //   };
    // });
  }
}

export class Ride {
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

  constructor() {}

  getYearTimesTwo() {
    return this.year * 2;
  }
}
