import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitListPresentationComponent } from './unit-list-presentation.component';

describe('UnitListPresentationComponent', () => {
  let component: UnitListPresentationComponent;
  let fixture: ComponentFixture<UnitListPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitListPresentationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitListPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
