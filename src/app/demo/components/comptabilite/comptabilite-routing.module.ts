import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComptabiliteListeComponent } from './comptabilite-liste/comptabilite-liste.component';
 
const routes: Routes = [{ path: '', component: ComptabiliteListeComponent }, 
  { path: 'comptabilite-liste', loadChildren: () => import('./comptabilite-liste/comptabilite-liste.module').then(m => m.ComptabiliteListeModule) },
  { path: 'salaire-vente-detail/:id', loadChildren: () => import('./salaire-vente-detail/salaire-vente-detail.module').then(m => m.SalaireVenteDetailModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComptabiliteRoutingModule { }
