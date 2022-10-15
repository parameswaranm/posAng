import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitListComponent } from './unit-list/unit-list.component';
import { UnitListPresentationComponent } from './unit-list-presentation/unit-list-presentation.component';
import { ManageUnitComponent } from './manage-unit/manage-unit.component';
import { UnitRoutingModule } from './unit-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '@shared/shared.module';



@NgModule({
  declarations: [
    UnitListComponent,
    UnitListPresentationComponent,
    ManageUnitComponent
  ],
  imports: [
    CommonModule,
    UnitRoutingModule,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    SharedModule
  ]
})
export class UnitModule { }
