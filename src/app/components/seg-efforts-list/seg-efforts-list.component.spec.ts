import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegEffortsListComponent } from './seg-efforts-list.component';

describe('SegEffortsListComponent', () => {
  let component: SegEffortsListComponent;
  let fixture: ComponentFixture<SegEffortsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegEffortsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegEffortsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
