import { IRide, IChartPoint } from "./model";

export class Rides {
  private _rides: Ride[];

  constructor(rides: IRide[]) {
    this._rides = [];
    rides.forEach(ride => this._rides.push(Object.assign(new Ride(), ride)));

    this.rides.sort((a, b) =>
      b.start_date > a.start_date ? 1 : a.start_date > b.start_date ? -1 : 0
    );
  }

  get rides(): Ride[] {
    return this._rides;
  }

  getRide(rideId: number) {
    return this.rides.find(ride => ride.id === rideId);
  }

  getRideAvgSpeedByYear(): IChartPoint[] {
    const calcWeightedAvgSpeed = (
      currentDistance: number,
      currentAvgSpeed: number,
      newDistance: number,
      newAverageSpeed: number
    ) => {
      if (currentAvgSpeed === 0) return newAverageSpeed;
      const currAvg = currentDistance * currentAvgSpeed;
      const newAvg = newDistance * newAverageSpeed;
      const totalDist = currentDistance + newDistance;
      const newAvg2 = (currAvg + newAvg) / totalDist;
      return newAvg2;
    };

    const avgSpeedByYear = this.rides.reduce((newArray: any, ride: Ride, ind: number) => {
      if (ind === 1) newArray = [];
      const date = ride.start_date.slice(0, 4);
      if (newArray[date] === undefined) newArray[date] = [0, 0];
      newArray[date][0] = calcWeightedAvgSpeed(
        newArray[date][1],
        newArray[date][0],
        ride.distance,
        ride.average_speed
      );
      newArray[date][1] = (newArray[date][0] || 0) + ride.distance;

      return newArray;
    });

    const avgSpeedByYearData = Object.entries(avgSpeedByYear).map(item => {
      return {
        x: item[0],
        y: Math.floor(item[1][0] * 10) / 10
      };
    });

    return avgSpeedByYearData;
  }

  getRidesByMonth(): IChartPoint[] {
    const distAgg = this.rides.reduce((newArray: any, ride: Ride, ind: number) => {
      if (ind === 1) newArray = [];
      const date = ride.start_date.slice(0, 7);
      if (newArray[date] === undefined) newArray[date] = [0, 0];
      newArray[date][0] = (newArray[date][0] || 0) + ride.distance;
      return newArray;
    });

    const distAggData = Object.entries(distAgg).map(item => {
      return {
        x: item[0],
        y: Math.floor(item[1][0])
      };
    });

    const aggData = [];
    for (let i = 1; i <= 12; i++) {
      const iLeading = ("00" + i).slice(-2);
      const month = distAggData
        .filter((item: IChartPoint) => {
          return item.x.includes("-" + iLeading);
        })
        .map((item: IChartPoint) => {
          item.x = item.x.slice(0, 4);
          return item;
        });
      aggData.push(month);
    }

    aggData.forEach(month => {
      for (let i = 2009; i <= 2019; i++) {
        if (month.find(year => year.x == i) === undefined) month.push({ x: i.toString(), y: 0 });
      }
      month.sort((a, b) => (a.x > b.x ? 1 : b.x > a.x ? -1 : 0));
    });

    return aggData;
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

  get date() {
    return this.start_date.slice(0, 10);
  }

  get cals() {
    return Math.floor(this.calories);
  }

  get movingTimeFormatted() {
    const dateObj = new Date(this.moving_time * 3600 * 1000);
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();

    const timeString =
      hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");

    return timeString;
  }

  get nameWithLink() {
    return `<span><a href='https://www.strava.com/activities/${this.id}' target='_blank'>${this.name}</a></span>`;
  }
}
