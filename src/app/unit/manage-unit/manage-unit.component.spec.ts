import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUnitComponent } from './manage-unit.component';

describe('ManageUnitComponent', () => {
  let component: ManageUnitComponent;
  let fixture: ComponentFixture<ManageUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageUnitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
