import {
  Component, Input, OnInit, OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { Civilite } from 'src/app/demo/enums/civilite.enum';
import { ContactEnum } from 'src/app/demo/enums/contact.enum';
import { Contact } from 'src/app/demo/models/contact';
 import { Role } from 'src/app/demo/models/Role';
import { User } from 'src/app/demo/models/User';
import { ContactService } from 'src/app/demo/service/contact/contact.service';

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

  @Input() contact: Contact = new Contact();


  roles: Role[] = [];

  id: number = this.activatedRoute.snapshot.params['id'];

  isEditing = false;
  submitted = false;
  isGuineeSelected = false;

  loading = false;
  loadingContact = false;

  errorMessage: string | null = null;
  errors: { [key: string]: string } = {};
  private subscriptions = new Subscription();

  readonly GUINEE = 'GUINEE-CONAKRY';
  readonly adresseCache = { ville: '', pays: '', code_postal: '', adresse: '', quartier: '' };

  readonly countries = [
    { name: this.GUINEE, code: 'GN' },
    { name: 'France', code: 'FR' }
  ];

  readonly civiliteOptions = Object.values(Civilite).map(c => ({ label: c, value: c }));

  readonly contactTypeOptions = [
    { label: 'Client spécifique', value: ContactEnum.ClientSpecifique },
    { label: 'Packing',          value: ContactEnum.Packing },
    // ajoute ici d’autres types si tu en as (livreur, propriétaire, …)
  ];

  constructor(
    private userervice: UserService,
    private contactService: ContactService,
    private roleService: RoleService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // this.getAllRoles();
    // this.loadUser();
    this.loadContact();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getAllRoles(): void {
    const sub = this.roleService.getRoles().subscribe({
      next: roles => this.roles = roles,
      error: () => {}
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

    loadContact(): void {
    this.loadingContact = true;
    const sub = this.contactService.getContactById(this.id).subscribe({
      next: resp => {
        this.contact = resp;
        console.log(this.contact);
        this.loadingContact = false;
      },
      error: (err) =>{
         console.error('Erreur récupération user :', err);
         this.loadingContact = false;
      },
      // complete: () => this.loadingContact = false
    });
    this.subscriptions.add(sub);
  }


  loadUser(): void {
    // this.loadingContact = true;
    // const sub = this.userervice.getUserById(this.id).subscribe({
    //   next: resp => {
    //     this.user = resp;
    //     this.initAdresse();
    //     if (this.user.role_id) this.getRoleById(this.user.role_id);
    //   },
    //   error: err => console.error('Erreur récupération user :', err),
    //   complete: () => this.loadingContact = false
    // });
    // this.subscriptions.add(sub);
  }

  private initAdresse(): void {
    if (!this.user.adresse) {
      this.user.adresse = {
        pays: '', ville: '', code_postal: '', adresse: '',
        quartier: '', complement_adresse: '', region: ''
      };
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
    this.isGuineeSelected = pays.toLowerCase() === this.GUINEE.toLowerCase();
    this.isGuineeSelected
      ? this.setAddressData(pays, '00224', this.GUINEE)
      : this.restorePreviousAddress(pays);
  }

  private setAddressData(pays: string, code_postal: string, adresse: string): void {
    Object.assign(this.user.adresse, { pays, code_postal, adresse });
  }

  private restorePreviousAddress(pays: string): void {
    if (this.adresseCache.pays === 'France') {
      Object.assign(this.user.adresse, this.adresseCache);
    } else {
      this.user.adresse = {
        pays, ville: '', adresse: '', code_postal: '',
        quartier: '', complement_adresse: '', region: ''
      };
    }
  }

  saveClient(): void {
    this.submitted = true;
    this.errors = {};

    if (!this.user.nom_complet || !this.user.phone) {
      return this.showWarn('Veuillez remplir tous les champs obligatoires.');
    }

    const payload = {
      nom_complet: this.user.nom_complet,
      phone: this.user.phone
    };

    this.userervice.createClient(payload).subscribe({
      next: () => {
        this.showSuccess('User créé avec succès');
        this.user = new User();
        this.submitted = false;
        this.errors = {};
        this.loadUser();
      },
      error: (err) => {
        console.error('Erreur lors de la création du user:', err);
        if (err.error?.errors) this.errors = err.error.errors;
        this.showError('Création du user échouée. Vérifiez les champs.');
      }
    });
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
}
