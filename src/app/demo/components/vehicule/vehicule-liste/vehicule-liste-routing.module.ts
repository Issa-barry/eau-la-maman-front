import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiculeListeComponent } from './vehicule-liste.component';

const routes: Routes = [{ path: '', component: VehiculeListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculeListeRoutingModule { }
