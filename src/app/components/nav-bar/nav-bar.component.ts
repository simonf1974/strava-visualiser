import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.scss"]
})
export class NavBarComponent implements OnInit {
  activeButton: string = "rides-chart";

  constructor() {}

  ngOnInit() {}

  setActive(buttonName: string) {
    this.activeButton = buttonName;
  }

  isActive(buttonName: string) {
    return this.activeButton === buttonName;
  }
}
