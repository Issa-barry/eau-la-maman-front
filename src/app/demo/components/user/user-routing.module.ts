import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListeComponent } from './user-liste/user-liste.component';

const routes: Routes = [{ path: '', component: UserListeComponent },
     { path: 'user-liste', loadChildren: () => import('./user-liste/user-liste.module').then(m => m.UserListeModule) }
    ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
