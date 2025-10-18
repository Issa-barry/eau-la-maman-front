import { OnInit } from '@angular/core';
import { Component } from '@angular/core';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'DASHBOARDS',
                icon: 'pi pi-home',
                items: [
                    {
                        label: 'Statistique-RH',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/dashboard']
                    },
                    {
                        label: "Chiffre-d'affaire",
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: ['/dashboard/dashboard-banking']
                    },
                     {
                        label: 'Stock',
                        icon: 'pi pi-fw pi-database',
                        routerLink: ['/dashboard/stock']
                    },
                ]
            },
            {
                label: 'MENU',
                icon: 'pi pi-fw pi-star-fill',
                items: [
                     {
                        label: 'Ventes',
                        icon: 'pi pi-fw pi-cart-plus',
                        routerLink: ['/dashboard/ventes']
                    },
                     
                    {
                        label: 'Facturation',
                        icon: 'pi pi-fw pi-calculator',
                        items: [
                            {
                                label: 'Factures-vente',
                                // icon: 'pi pi-fw pi-cart-plus',
                                routerLink: ['/dashboard/facturation']
                            },
                            {
                                label: 'Facture-Packing',
                                // icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/dashboard/parametre/role-liste']
                            }
                        ]
                    },
                        {
                        label: 'Packing',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/dashboard/packing']
                    },
                    
                    //    {
                    //     label: 'Achats',
                    //     icon: 'pi pi-fw pi-map-marker',
                    //     routerLink: ['/dashboard/ventes']
                    // }, 
                ]
            },
             {
                label: 'UTILISATEURS',
                icon: 'pi pi-fw pi-star-fill',
                items: [
                    {
                        label: 'Contact',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/dashboard/contact']
                    },
                    {
                        label: 'Employes',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink: ['/dashboard/user']
                    },
                    {
                        label: 'Véhicules',
                        icon: 'pi pi-fw pi-truck',
                        routerLink: ['/dashboard/vehicule']
                    }
                   
                ]
            },
            // {
            //     label: 'AUTRE',
            //     icon: 'pi pi-cog',
            //     items: [
            //         {
            //             label: 'Paramètre',
            //             icon: 'pi pi-fw pi-cog',
            //             items: [
            //                 {
            //                     label: 'Générale',
            //                     icon: 'pi pi-fw pi-globe',
            //                     routerLink: ['/dashboard/parametre']
            //                 },
            //                 {
            //                     label: 'Role & Permission',
            //                     icon: 'pi pi-fw pi-lock-open',
            //                     routerLink: ['/dashboard/parametre/role-liste']
            //                 }
            //             ]
            //         }
            //     ]
            // }
        ];
    }
}
