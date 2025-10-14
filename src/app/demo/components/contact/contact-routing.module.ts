import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactListeComponent } from './contact-liste/contact-liste.component';
 
const routes: Routes = [
   { path: '', component: ContactListeComponent }, 
   { path: 'contact-liste', loadChildren: () => import('./contact-liste/contact-liste.module').then(m => m.ContactListeModule) },
   { path: 'contact-new-client', loadChildren: () => import('./contact-new-client/contact-new-client.module').then(m => m.ContactNewClientModule) },
   { path: 'contact-detail-client/:id', loadChildren: () => import('./contact-detail-client/contact-detail-client.module').then(m => m.ContactDetailClientModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { } 
 