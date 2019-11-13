import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RidesListContainerComponent } from './rides-list-container.component';

describe('RidesListContainerComponent', () => {
  let component: RidesListContainerComponent;
  let fixture: ComponentFixture<RidesListContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RidesListContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RidesListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
