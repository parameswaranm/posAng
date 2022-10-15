import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { UnitListComponent } from './unit-list/unit-list.component';



const routes: Routes = [
  {
    path: '',
    component: UnitListComponent,
    data: { claimType: 'PRO_MANAGE_UNIT' },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitRoutingModule { }
