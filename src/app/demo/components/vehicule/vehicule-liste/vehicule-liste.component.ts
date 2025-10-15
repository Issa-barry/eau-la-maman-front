import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';

 import { Role } from '../../../models/Role';
 import { RoleService } from '../../../service/role/role.service';
import { Statut } from 'src/app/demo/enums/statut.enum';
import { MenuItem } from 'primeng/api';
import { User } from 'src/app/demo/models/User';
import { UserService } from 'src/app/demo/service/users/user.service';
import { VehiculeService } from 'src/app/demo/service/vehicule/vehicule.service';
import { Vehicule } from 'src/app/demo/models/vehicule.model';

@Component({
  selector: 'app-vehicule-liste',
  templateUrl: './vehicule-liste.component.html',
  styleUrl: './vehicule-liste.component.scss',
    providers: [MessageService, ConfirmationService],
  
})
export class VehiculeListeComponent  implements OnInit {
    users: User[] = [];
    user: User = new User();

    vehicules: Vehicule[] = [];
    vehicule: Vehicule = new Vehicule();

    roles: Role[] = [];
    optionPays = [
        { label: 'GUINEE-CONAKRY', value: 'Guinée-Conakry' },
        { label: 'FRANCE', value: 'France' },
    ];

    vehiculeDialog = false;
    deleteVehiculeDialog = false;
    deleteVehiculesDialog = false;

    userDialog = false;
    deleteUserDialog = false;
    deleteUsersDialog = false;
    submitted = false;

    loading = false;
    skeletonRows = Array.from({ length: 5 }, () => ({}));
    rowsPerPageOptions = [5, 10, 20];

    selectedUsers: User[] = [];

    selectedVehicules: Vehicule[] = [];

    isValidPhone = true;
    isValidCodePostal = true;
    isCodePostalDisabled = false;
    isValidPays = true;

    // toolbar
    items: MenuItem[] = [];
    cardMenu: MenuItem[] = [];

    constructor(
        private userService: UserService,
        private vehiculeService: VehiculeService,
        private roleService: RoleService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.getAllUsers();
        this.getAllRoles();
        this.getAllVehicules();

        this.items = [
            {
                label: 'Client', 
                icon: 'pi pi-external-link',
                url: '/dashboard/contact/contact-new-client',
            },
            {
                label: 'Employé',
                icon: 'pi pi-external-link',
                routerLink: ['/dashboard/user/user-new'],
            },
        ];
        this.cardMenu = [
            {
                label: 'Save',
                icon: 'pi pi-fw pi-check',
            },
            {
                label: 'Update',
                icon: 'pi pi-fw pi-refresh',
            },
            {
                label: 'Delete',
                icon: 'pi pi-fw pi-trash',
            },
        ];
    }
// Veicule

//variable de pafination
totalRecords = 0;
rows = 10;           // rows par page
currentPage = 1;


getAllVehicules(page: number = 1): void {
  this.loading = true;
  this.vehiculeService.getAll({ per_page: this.rows, page }).subscribe({
    next: (res) => {
      this.vehicules    = res.data;      // ✅ tableau
      this.totalRecords = res.total;
      this.rows         = res.per_page;
      this.currentPage  = res.current_page;
      this.loading = false;
      console.log('Véhicules chargés:', res);
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des vehicules:', err);
      this.loading = false;
    },
  });
}

onPage(event: any) {
  const page = event.first / event.rows + 1;
  this.rows = event.rows;
  this.getAllVehicules(page);
}





    // Users

    getAllUsers(): void {
        this.loading = true;
        this.userService.getUser().subscribe({
            next: (res) => {
                this.users = res;
                this.loading = false;
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la récupération des users:',
                    err
                );
                this.loading = false;
            },
        });
    }

    getAllRoles(): void {
        this.roleService.getRoles().subscribe({
            next: (res) => (this.roles = res),
            error: (err) => console.error('Erreur chargement rôles:', err),
        });
    }

    validatePhone(): void {
        const regex = /^(?:\+|00)?(\d{1,3})[-.\s]?\d{10,}$/;
        this.isValidPhone = regex.test(this.user.phone || '');
    }

    validateCodePostal(): void {
        const cp = this.user.adresse?.code_postal?.toString() || '';
        this.isValidCodePostal = /^\d{5}$/.test(cp);
    }

    validatePays(): void {
        this.isValidPays = !!this.user.adresse?.pays;
        if (this.user.adresse?.pays === 'GUINEE-CONAKRY') {
            this.user.adresse.code_postal = '00000';
            this.isCodePostalDisabled = true;
        } else {
            this.isCodePostalDisabled = false;
        }
    }

    saveUser(): void {
        this.submitted = true;
        this.validatePays();
        this.validateCodePostal();
        this.validatePhone();

        this.user.role = String(
            this.user.role?.name || this.user.role
        );
        this.user.adresse.code_postal = String(
            this.user.adresse.code_postal
        );

        const serviceCall =
            this.user.id && this.user.password
                ? this.userService.updateUser(
                      this.user.id,
                      this.user
                  )
                : this.userService.createUser(this.user);

        serviceCall.subscribe({
            next: () => {
                this.getAllUsers();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'User enregistré avec succès',
                    life: 3000,
                });
            },
            error: (err) => {
                console.error('Erreur:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "L'opération a échoué",
                    life: 3000,
                });
            },
        });

        this.userDialog = false;
    }

    editUser(user: User): void {
        this.user = Object.assign(new User(), user);
        this.userDialog = true;
    }

    deleteUser(user: User): void {
        this.user = Object.assign(new User(), user);
        this.deleteUserDialog = true;
    }

    confirmDelete(): void {
        this.deleteUserDialog = false;
        if (!this.user.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'ID du user non défini',
                life: 3000,
            });
            return;
        }

        this.userService.deleteUser(this.user.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'User supprimé avec succès',
                    life: 3000,
                });
                this.getAllUsers();
            },
            error: (err) => {
                console.error('Erreur suppression:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec de la suppression du user',
                    life: 3000,
                });
            },
        });
    }

    deleteSelectedVehicules(): void {
        this.deleteVehiculesDialog = true;
    }

     
    confirmDeleteSelected(): void {
        this.deleteVehiculesDialog = false;
        // Implémentez la logique réelle si vous avez un service côté backend
        this.selectedVehicules = [];
        this.messageService.add({
            severity: 'success',
            summary: 'Suppression multiple',
            detail: 'Véhicules supprimés',
            life: 3000,
        });
    }

    openNew(): void {
        this.vehicule = new Vehicule();
        this.submitted = false;
        this.vehiculeDialog = true;
    }

    hideDialog(): void {
        this.vehiculeDialog = false;
        this.submitted = false;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    onGotToVehiculeDetail(vehicule: Vehicule): void {
        this.router.navigate(['/dashboard/vehicule/vehicule-detail', vehicule.id]);
    }
    showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }

    private updateStatutVehicule(
        vehicule: Vehicule,
        statut: Statut,
        severity: string,
        action: string
    ) {
        if (!vehicule.id) return;

        this.vehiculeService.updateStatutVehicule(vehicule.id, statut).subscribe({
            next: (updated) => {
                this.showMessage(
                    severity,
                    'Statut modifié',
                    // `Véhicule "${updated.nom}" ${action}.`
                    `Véhicule ${action}.`
                );
                this.getAllVehicules();
            },
            error: (err) => {
                this.showMessage(
                    'error',
                    'Erreur',
                    err.message || `Échec de la modification du statut.`
                );
            },
        });
    }

    // Statuts avec Enum
    validerVehicule(vehicule: Vehicule) {
        this.updateStatutVehicule(vehicule, Statut.ACTIVE, 'success', 'validée');
    }

    bloquerVehicule(vehicule: Vehicule) {
        this.updateStatutVehicule(vehicule, Statut.BLOQUE, 'warn', 'bloquée');
    }

    debloquerVehicule(vehicule: Vehicule) {
        this.updateStatutVehicule(
            vehicule,
            Statut.ACTIVE,
            'success',
            'débloquée'
        );
    }
}
