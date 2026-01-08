import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalairePackingListeComponent } from './salaire-packing-liste.component';

const routes: Routes = [{ path: '', component: SalairePackingListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalairePackingListeRoutingModule { }
