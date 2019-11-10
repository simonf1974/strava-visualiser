import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegPerfChartComponent } from './seg-perf-chart.component';

describe('SegPerfChartComponent', () => {
  let component: SegPerfChartComponent;
  let fixture: ComponentFixture<SegPerfChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegPerfChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegPerfChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
