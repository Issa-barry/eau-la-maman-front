import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { authGuard } from './demo/guards/auth.guard';

const routerOptions: ExtraOptions = {
    anchorScrolling: 'enabled'
};

const routes: Routes = [ 
    { 
        path: 'dashboard', 
        component: AppLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', loadChildren: () => import('./demo/components/dashboards/dashboards.module').then(m => m.DashboardsModule) },
            { path: '', loadChildren: () => import('./demo/components/dashboards/dashboards.module').then(m => m.DashboardsModule) },
            { path: 'uikit', data: { breadcrumb: 'UI Kit' }, loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule) },
            { path: 'utilities', data: { breadcrumb: 'Utilities' }, loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
            { path: 'pages', data: { breadcrumb: 'Pages' }, loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) },
            { path: 'profile', data: { breadcrumb: 'User Management' }, loadChildren: () => import('./demo/components/profile/profile.module').then(m => m.ProfileModule) },
            { path: 'documentation', data: { breadcrumb: 'Documentation' }, loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
            { path: 'blocks', data: { breadcrumb: 'Prime Blocks' }, loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
            { path: 'ecommerce', data: { breadcrumb: 'E-Commerce' }, loadChildren: () => import('./demo/components/ecommerce/ecommerce.module').then(m => m.EcommerceModule) },
            { path: 'apps', data: { breadcrumb: 'Apps' }, loadChildren: () => import('./demo/components/apps/apps.module').then(m => m.AppsModule) },
            { path: 'agence', loadChildren: () => import('./demo/components/agence/agence.module').then(m => m.AgenceModule) },
            { path: 'contact', loadChildren: () => import('./demo/components/contact/contact.module').then(m => m.ContactModule) },
            { path: 'transfert',data: { breadcrumb: 'Transfert' }, loadChildren: () => import('./demo/components/transfert/transfert.module').then(m => m.TransfertModule) },
            { path: 'facturation', loadChildren: () => import('./demo/components/facturation/facturation.module').then(m => m.FacturationModule) },
            { path: 'parametre', loadChildren: () => import('./demo/components/parametre/parametre.module').then(m => m.ParametreModule) },
            { path: 'stock', loadChildren: () => import('./demo/components/stock/stock.module').then(m => m.StockModule) },
            { path: 'ventes', loadChildren: () => import('./demo/components/ventes/ventes.module').then(m => m.VentesModule) },
            { path: 'packing', loadChildren: () => import('./demo/components/packing/packing.module').then(m => m.PackingModule) },
            { path: 'user', loadChildren: () => import('./demo/components/user/user.module').then(m => m.UserModule) },



        ]
    },
    { path: '', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
    { path: 'auth', data: { breadcrumb: 'Auth' }, loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
    { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
    { path: 'notfound', loadChildren: () => import('./demo/components/notfound/notfound.module').then(m => m.NotfoundModule) },
    { path: '**', redirectTo: '/notfound' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, routerOptions)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
