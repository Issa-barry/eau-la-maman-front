import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserNewComponent } from './user-new.component';

const routes: Routes = [{ path: '', component: UserNewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserNewRoutingModule { }
