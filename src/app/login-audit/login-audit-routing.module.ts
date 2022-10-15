import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { LoginAuditListComponent } from './login-audit-list/login-audit-list.component';

const routes: Routes = [
  {
    path: '',
    component: LoginAuditListComponent,
    data: { claimType: 'LOGS_VIEW_LOGIN_AUDITS' },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ], exports: [
    RouterModule
  ]
})
export class LoginAuditRoutingModule { }
