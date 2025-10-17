import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactNewComponent } from './contact-new.component';

const routes: Routes = [{ path: '', component: ContactNewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactNewRoutingModule { }
