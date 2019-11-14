import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { RideService } from "src/app/shared/ride.service";
import { Rides, Ride } from "src/app/model/ride";

@Component({
  selector: "app-rides-list-container",
  templateUrl: "./rides-list-container.component.html",
  styleUrls: ["./rides-list-container.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class RidesListContainerComponent implements OnInit {
  rides: Rides;
  rideDrillDowns: Ride[] = [];
  isReady = false;

  constructor(private rideService: RideService) {}

  ngOnInit() {
    this.rideService.get().then((rides: Rides) => {
      this.rides = rides;
      this.isReady = true;
    });
  }

  rideSelected(rideId: number) {
    this.rideDrillDowns.push(this.rides.getRide(rideId));
  }
}
