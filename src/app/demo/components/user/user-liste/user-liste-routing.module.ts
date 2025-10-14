import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListeComponent } from './user-liste.component';

const routes: Routes = [{ path: '', component: UserListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserListeRoutingModule { }
