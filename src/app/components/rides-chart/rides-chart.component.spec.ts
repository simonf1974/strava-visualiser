import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RidesChartComponent } from './rides-chart.component';

describe('RidesChartComponent', () => {
  let component: RidesChartComponent;
  let fixture: ComponentFixture<RidesChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RidesChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RidesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
