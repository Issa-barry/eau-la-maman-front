import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiculeNewComponent } from './vehicule-new.component';

const routes: Routes = [{ path: '', component: VehiculeNewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculeNewRoutingModule { }
