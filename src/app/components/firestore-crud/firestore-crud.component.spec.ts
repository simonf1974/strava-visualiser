import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirestoreCrudComponent } from './firestore-crud.component';

describe('FirestoreCrudComponent', () => {
  let component: FirestoreCrudComponent;
  let fixture: ComponentFixture<FirestoreCrudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirestoreCrudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirestoreCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
