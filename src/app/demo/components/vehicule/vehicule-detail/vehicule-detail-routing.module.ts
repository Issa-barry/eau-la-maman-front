import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiculeDetailComponent } from './vehicule-detail.component';

const routes: Routes = [{ path: '', component: VehiculeDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculeDetailRoutingModule { }
