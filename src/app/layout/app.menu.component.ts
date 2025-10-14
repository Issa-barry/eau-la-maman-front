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
                    }
                ]
            },
            {
                label: 'MENU',
                icon: 'pi pi-fw pi-star-fill',
                items: [
                     {
                        label: 'Ventes',
                        icon: 'pi pi-fw pi-map-marker',
                        routerLink: ['/dashboard/ventes']
                    },
                    //    {
                    //     label: 'Packing',
                    //     icon: 'pi pi-fw pi-box',
                    //     routerLink: ['/dashboard/packing']
                    // },
                     
                    //  {
                    //     label: 'Stock',
                    //     icon: 'pi pi-fw pi-database',
                    //     routerLink: ['/dashboard/stock']
                    // },
                     {
                        label: 'Facturation',
                        icon: 'pi pi-fw pi-database',
                        routerLink: ['/dashboard/facturation']
                    },
                    //    {
                    //     label: 'Achats',
                    //     icon: 'pi pi-fw pi-map-marker',
                    //     routerLink: ['/dashboard/ventes']
                    // },
                    {
                        label: 'Users-Contact',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/dashboard/user']
                    },
                    // {
                    //     label: 'Dépots',
                    //     icon: 'pi pi-fw pi-map-marker',
                    //     routerLink: ['/dashboard/agence']
                    // }
                ]
            },
            {
                label: 'AUTRE',
                icon: 'pi pi-cog',
                items: [
                    {
                        label: 'Paramètre',
                        icon: 'pi pi-fw pi-cog',
                        items: [
                            {
                                label: 'Générale',
                                icon: 'pi pi-fw pi-globe',
                                routerLink: ['/dashboard/parametre']
                            },
                            {
                                label: 'Role & Permission',
                                icon: 'pi pi-fw pi-lock-open',
                                routerLink: ['/dashboard/parametre/role-liste']
                            }
                        ]
                    }
                ]
            }
        ];
    }
}
