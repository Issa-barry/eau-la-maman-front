import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalairePackingDetailComponent } from './salaire-packing-detail.component';

const routes: Routes = [{ path: '', component: SalairePackingDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalairePackingDetailRoutingModule { }
