import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiculeListeComponent } from './vehicule-liste/vehicule-liste.component';

const routes: Routes = [
    { path: '', component: VehiculeListeComponent },
    {
        path: 'vehicule-liste',
        loadChildren: () =>
            import('./vehicule-liste/vehicule-liste.module').then(
                (m) => m.VehiculeListeModule
            ),
    },
    {
        path: 'vehicule-new',
        loadChildren: () =>
            import('./vehicule-new/vehicule-new.module').then(
                (m) => m.VehiculeNewModule
            ),
    },
    {
        path: 'vehicule-detail/:id',
        loadChildren: () =>
            import('./vehicule-detail/vehicule-detail.module').then(
                (m) => m.VehiculeDetailModule
            ),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VehiculeRoutingModule {}
