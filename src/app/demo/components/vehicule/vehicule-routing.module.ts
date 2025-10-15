import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiculeListeComponent } from './vehicule-liste/vehicule-liste.component';
 
const routes: Routes = [{ path: '', component: VehiculeListeComponent }, { path: 'vehicule-liste', loadChildren: () => import('./vehicule-liste/vehicule-liste.module').then(m => m.VehiculeListeModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculeRoutingModule { }
