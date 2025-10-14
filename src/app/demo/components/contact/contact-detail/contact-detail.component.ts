import {
    Component,
    Input,
    OnInit,
    OnDestroy 
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { Civilite } from 'src/app/demo/enums/civilite.enum';
import { Agence } from 'src/app/demo/models/agence';
import { Role } from 'src/app/demo/models/Role';
import { User } from 'src/app/demo/models/User';
 
import { AgenceService } from 'src/app/demo/service/agence/agence.service';
 import { RoleService } from 'src/app/demo/service/role/role.service';
import { UserService } from 'src/app/demo/service/users/user.service';
 
@Component({ 
    selector: 'app-contact-detail',
    templateUrl: './contact-detail.component.html',
    styleUrl: './contact-detail.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class ContactDetailComponent implements OnInit, OnDestroy {
    @Input() user: User = new User();
    @Input() role: Role = new Role();

    roles: Role[] = [];
    agence: Agence = new Agence();

    id: number = this.activatedRoute.snapshot.params['id'];
    isEditing = false;
    loading = false;
    loadingAgence = false;
    loadingRoles = false;
    loadingUser = false; 
    loadingAgenceSection = false;
    submitted = false;
    codeRecuperer = false;
    paysAChanger = false;
    isGuineeSelected = false;

    reference: string = '';
    agenceDialog = false;
    dialogAgenceDetails = false;
    errorMessage: string | null = null;
    errors: { [key: string]: string } = {};

    private subscriptions = new Subscription();

    readonly GUINEE = 'GUINEE-CONAKRY';
    readonly adresseCache = { ville: '', pays: '', code_postal: '', adresse: '', quartier: '' };

    readonly countries = [
        { name: this.GUINEE, code: 'GN' },
        { name: 'France', code: 'FR' },
    ];

    readonly civiliteOptions = Object.values(Civilite).map(civ => ({ label: civ, value: civ }));

    constructor(
        private userervice: UserService,
        private agenceService: AgenceService,
        private roleService: RoleService, 
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.getAllRoles();
        this.onGetUser();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    getAllRoles(): void {
        this.loadingRoles = true;
        const sub = this.roleService.getRoles().subscribe({
            next: roles => this.roles = roles,
            error: () => {},
            complete: () => this.loadingRoles = false
        });
        this.subscriptions.add(sub);
    }

    getRoleById(id: number): void {
        const sub = this.roleService.getRoleById(id).subscribe({
            next: role => this.user.role = this.roles.find(r => r.id === role.id) ?? role,
            error: err => console.error('Erreur récupération rôle :', err)
        });
        this.subscriptions.add(sub);
    }

    onGetUser(): void {
        this.loadingUser = true;
        const sub = this.userervice.getUserById(this.id).subscribe({
            next: resp => {
                this.user = resp;
                this.initAdresse();
                if (this.user.role_id) this.getRoleById(this.user.role_id);
                if (this.user.agence_id) this.getAgenceById(this.user.agence_id);
            },
            error: err => console.error('Erreur récupération user :', err),
            complete: () => this.loadingUser = false
        });
        this.subscriptions.add(sub);
    }

    private initAdresse(): void {
        if (!this.user.adresse) {
            this.user.adresse = { pays: '', ville: '', code_postal: '', adresse: '', quartier: '', complement_adresse: '', region: '' };
        }
        const pays = this.user.adresse.pays?.trim().toLowerCase();
        this.isGuineeSelected = pays === this.GUINEE.toLowerCase();
        Object.assign(this.adresseCache, this.user.adresse);
    }

    toggleEditMode(): void {
        this.isEditing = !this.isEditing;
    }

    onCountryChange(event: { value: string }): void {
        const pays = event.value;
        this.paysAChanger = true;
        this.isGuineeSelected = pays.toLowerCase() === this.GUINEE.toLowerCase();
        this.isGuineeSelected ? this.setAddressData(pays, '00224', this.GUINEE) : this.restorePreviousAddress(pays);
    }

    private setAddressData(pays: string, code_postal: string, adresse: string): void {
        Object.assign(this.user.adresse, { pays, code_postal, adresse });
    }

    private restorePreviousAddress(pays: string): void {
        if (this.adresseCache.pays === 'France') {
            Object.assign(this.user.adresse, this.adresseCache);
        } else {
            this.user.adresse = { pays, ville: '', adresse: '', code_postal: '', quartier: '', complement_adresse: '', region: '' };
        }
    }

    private isUserValid(): boolean {
        const a = this.user.adresse;
        return !!(this.user.role && this.user.civilite && this.user.nom_complet && this.user.email && this.user.phone && a?.pays && a.ville && a.code_postal);
    }

    private trimObjectValues(obj: any): void {
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].trim();
            }
        });
    }

    trimFields(): void {
        this.trimObjectValues(this.user);
        this.trimObjectValues(this.user.adresse);
    }

    saveUser(): void {
        this.submitted = true;
        this.trimFields();
        this.errors = {};

        if (!this.isUserValid()) {
            return this.showWarn('Veuillez remplir tous les champs obligatoires.');
        }

        const selectedRole = this.roles.find(r => r.name === this.user.role);
        if (selectedRole) this.user.roles = selectedRole;

        this.loading = true;
        const sub = this.userervice.updateUser(this.id, this.user).subscribe({
            next: resp => {
                this.user = resp;
                this.submitted = false; 
                this.isEditing = false;
                this.onGetUser();
                this.showSuccess('User mis à jour avec succès.');
            },
            error: err => {
                console.error('Erreur mise à jour user :', err);
                this.errors = err.error?.errors || {};
                this.showError('Mise à jour échouée.');
            },
            complete: () => this.loading = false
        });
        this.subscriptions.add(sub);
    }

    private showMessage(severity: string, summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }

    private showSuccess(msg: string): void {
        this.showMessage('success', 'Succès', msg);
    }

    private showError(msg: string): void {
        this.showMessage('error', 'Erreur', msg);
    }

    private showWarn(msg: string): void {
        this.showMessage('warn', 'Attention', msg);
    }

    getAgenceById(id: number): void {
        if (!id) return;
        this.loadingAgenceSection = true;
        const sub = this.agenceService.getAgenceById(id).subscribe({
            next: resp => {
                this.agence = resp ?? new Agence();
                this.codeRecuperer = !!resp;
            },
            error: err => {
                console.error('Erreur récupération agence :', err);
                this.errorMessage = 'Agence introuvable.';
                this.agence = new Agence();
                this.codeRecuperer = false;
            },
            complete: () => this.loadingAgenceSection = false
        });
        this.subscriptions.add(sub);
    }

    openAffecterAgenceDialog(): void {
        this.agenceDialog = true;
    }

    hideDialog(): void {
        this.agenceDialog = false;
    }

    onRecupererAgence(): void {
        const ref = this.reference?.trim().toUpperCase();
        if (!ref) {
            this.errorMessage = 'Référence requise';
            return;
        }

        this.errorMessage = null;
        this.loadingAgence = true;

        const sub = this.agenceService.getAgenceByReference(ref).subscribe({
            next: (resp: Agence) => {
                this.agence = resp;
                this.codeRecuperer = true;
            },
            error: (err: any) => {
                console.error('Erreur récupération agence :', err);
                this.errorMessage = err.message || 'Agence introuvable.';
                this.codeRecuperer = false;
                this.agence = new Agence();
            },
            complete: () => this.loadingAgence = false
        });
        this.subscriptions.add(sub);
    }

    confirmationAffecterAgence(): void {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment affecter le user à cette agence ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger', 
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => this.affecterAgence(true),
            reject: () => this.showMessage('info', 'Annulation', "L'affectation a été annulée.")
        });
    }

    private resetAffectationUI(): void {
        this.reference = '';
        this.errorMessage = null;
        this.codeRecuperer = false;
        this.agenceDialog = false;
        this.dialogAgenceDetails = false;
    }

    affecterAgence(refresh = false): void {
        if (!this.user?.id || !this.reference?.trim()) {
            this.errorMessage = 'Référence invalide.';
            return;
        }

        const reference = this.reference.trim().toUpperCase();
        this.loadingAgence = true;

        const sub = this.userervice.affecterAgenceByReference(this.user.id, reference).subscribe({
            next: (resp: User) => {
                this.user = resp;
                this.showSuccess('Affectation réussie.');
                this.resetAffectationUI();
                this.onGetUser();
            },
            error: (err: any) => {
                console.error('Erreur affectation agence :', err);
                this.showError(err.message ?? 'Erreur inconnue.');
                this.codeRecuperer = false;
            },
            complete: () => this.loadingAgence = false
        });
        this.subscriptions.add(sub);
    }

    desaffecterAgence(): void {
        if (!this.user.id) {
            this.showWarn('Aucun user sélectionné.');
            return;
        }

        this.confirmationService.confirm({
            message: 'Voulez-vous désaffecter ce user ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loadingAgence = true;
                const sub = this.userervice.desaffecterAgence(this.user.id!).subscribe({
                    next: (resp: User) => {
                        this.user = resp;
                        this.agence = new Agence();
                        this.resetAffectationUI();
                        this.showSuccess('Désaffectation réussie.');
                        this.onGetUser();
                    },
                    error: (err: any) => {
                        console.error('Erreur désaffectation :', err);
                        this.showError(err.message ?? 'Erreur inconnue.');
                    },
                    complete: () => this.loadingAgence = false
                });
                this.subscriptions.add(sub);
            },
            reject: () => {}
        });
    }

    openAgenceDetailsDialog() {
        this.dialogAgenceDetails = true;
    }
}
