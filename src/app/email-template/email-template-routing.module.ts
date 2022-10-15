import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@core/security/auth.guard';
import { EmailTemplateListComponent } from './email-template-list/email-template-list.component';
import { EmailTemplateManageComponent } from './email-template-manage/email-template-manage.component';
import { EmailTemplateResolver } from './email-template.resolver';

const routes: Routes = [
  {
    path: '',
    component: EmailTemplateListComponent,
    data: { claimType: 'EMAIL_MANAGE_EMAIL_TEMPLATES' },
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: EmailTemplateManageComponent,
    resolve: { emailTemplate: EmailTemplateResolver },
    data: { claimType: ['EMAIL_MANAGE_EMAIL_TEMPLATES', 'EMAIL_MANAGE_EMAIL_TEMPLATES'] },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailTemplateRoutingModule { }
