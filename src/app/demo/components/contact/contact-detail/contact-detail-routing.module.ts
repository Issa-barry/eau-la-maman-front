import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactDetailComponent } from './contact-detail.component';

const routes: Routes = [{ path: '', component: ContactDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactDetailRoutingModule { }
