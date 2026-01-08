import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComptabiliteListeComponent } from './comptabilite-liste.component';

const routes: Routes = [{ path: '', component: ComptabiliteListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComptabiliteListeRoutingModule { }
