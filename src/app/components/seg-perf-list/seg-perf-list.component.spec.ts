import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegPerfListComponent } from './seg-perf-list.component';

describe('SegPerfListComponent', () => {
  let component: SegPerfListComponent;
  let fixture: ComponentFixture<SegPerfListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegPerfListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegPerfListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
