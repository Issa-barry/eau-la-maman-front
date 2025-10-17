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
import { Contact } from 'src/app/demo/models/contact';
import { ContactService } from 'src/app/demo/service/contact/contact.service';

@Component({
    selector: 'app-contact-liste',
    templateUrl: './contact-liste.component.html',
    styleUrls: ['./contact-liste.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class ContactListeComponent implements OnInit {
    users: User[] = [];
    user: User = new User();

     contacts: Contact[] = [];
     contact: Contact = new Contact();
    meta = { current_page: 1, per_page: 10, total: 0, last_page: 1 };

    roles: Role[] = [];
    optionPays = [
        { label: 'GUINEE-CONAKRY', value: 'Guinée-Conakry' },
        { label: 'FRANCE', value: 'France' },
    ];

    contactDialog = false;
    deleteContactDialog = false;
    submitted = false;
    loading = false;
    skeletonRows = Array.from({ length: 5 }, () => ({}));
    rowsPerPageOptions = [5, 10, 20];

    // selectedUsers: User[] = [];
    selectedContacts: Contact[] = [];

    isValidPhone = true;
    isValidCodePostal = true;
    isCodePostalDisabled = false;
    isValidPays = true;

    // toolbar
    items: MenuItem[] = [];
    cardMenu: MenuItem[] = [];

    constructor(
        private userService: UserService,
        private contactService: ContactService,
        private roleService: RoleService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
         this.getAllContacts();

        this.items = [
            {
                label: 'Client',
                icon: 'pi pi-external-link',
                url: '/dashboard/user/user-new-client',
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

 getAllContacts(): void {
  this.loading = true;
  this.contactService.getAll({ page: this.meta.current_page, per_page: this.meta.per_page }).subscribe({
    next: (p) => {
      this.contacts = p.data ?? [];
      this.meta = {
        current_page: p.current_page,
        per_page: p.per_page,
        total: p.total,
        last_page: p.last_page,
      };
      this.loading = false;
      console.log(this.contacts);
      
    },
    error: () => {
      this.contacts = [];
      this.loading = false;
    },
  });
}

onPageChange(e: any) {
  // PrimeNG paginator 0-based
  const page = typeof e.page === 'number' ? e.page + 1 : Math.floor((e.first ?? 0) / (e.rows ?? this.meta.per_page)) + 1;
  this.meta.current_page = page;
  this.meta.per_page = e.rows ?? this.meta.per_page;
  this.getAllContacts();
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
                this.getAllContacts();
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

        this.contactDialog = false;
    }

    editUser(user: User): void {
        this.user = Object.assign(new User(), user);
        this.contactDialog = true;
    }

    deleteContact(user: User): void {
        this.user = Object.assign(new User(), user);
        this.deleteContactDialog = true;
    }

    confirmDelete(): void {
        this.deleteContactDialog = false;
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
                this.getAllContacts();
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

    confirmDeleteSelected(): void {
        this.deleteContactDialog = false;
        // Implémentez la logique réelle si vous avez un service côté backend
        this.selectedContacts = [];
        this.messageService.add({
            severity: 'success',
            summary: 'Suppression multiple',
            detail: 'Users supprimés',
            life: 3000,
        });
    }

    openNew(): void {
        this.user = new User();
        this.submitted = false;
        this.contactDialog = true;
    }

    hideDialog(): void {
        this.contactDialog = false;
        this.submitted = false;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    onGotToNewUser(): void {
        this.router.navigate(['/dashboard/user/user-new']);
    }

    onGotToContactDetail(contact: Contact): void {
        this.router.navigate(['/dashboard/contact/contact-detail', contact.id]);
    }
    showMessage(severity: string, summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }

    private updateStatutUser(
        user: User,
        statut: Statut,
        severity: string,
        action: string
    ) {
        if (!user.id) return;

        this.userService.updateStatut(user.id, statut).subscribe({
            next: (updated) => {
                this.showMessage(
                    severity,
                    'Statut modifié',
                    `User "${updated.nom_complet}" ${action}.`
                );
                this.getAllContacts();
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
    validerContact(user: User) {
        this.updateStatutUser(user, Statut.ACTIVE, 'success', 'validée');
    }

    bloquerContact(user: User) {
        this.updateStatutUser(user, Statut.BLOQUE, 'warn', 'bloquée');
    }

    debloquerContact(user: User) {
        this.updateStatutUser(
            user,
            Statut.ACTIVE,
            'success',
            'débloquée'
        );
    }
    
    deleteSelectedContacts(): void {
        this.deleteContactDialog = true;
    }

}
