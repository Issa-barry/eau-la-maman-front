import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

import { Civilite } from 'src/app/demo/enums/civilite.enum';
import { Role } from 'src/app/demo/models/Role';
import { User } from 'src/app/demo/models/User';
import { RoleService } from 'src/app/demo/service/role/role.service';
import { UserService } from 'src/app/demo/service/users/user.service';

@Component({
  selector: 'app-contact-new',
  standalone: false,
  templateUrl: './contact-new.component.html',
  styleUrl: './contact-new.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ContactNewComponent implements OnInit {
  countries: any[] = [];
  submitted = false;
  user: User = new User();
  roles: Role[] = [];
  errors: { [key: string]: string } = {};
  isGuineeSelected = false;
  loading = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.countries = [
      { name: 'GUINEE-CONAKRY', code: 'GN', value: 'GUINEE-CONAKRY' },
      { name: 'France',         code: 'FR', value: 'FRANCE' },
    ];

    // S'assurer que l'objet existe
    this.user.adresse = this.user.adresse ?? {
      pays: '',
      adresse: '',
      complement_adresse: '',
      ville: '',
      quartier: '',
      code_postal: '',
      region: '',
    };

    // Pré-sélection par défaut
    this.user.adresse.pays = this.countries[0].value; // 'GUINEE-CONAKRY'
    this.isGuineeSelected = true;

    this.getAllRoles();
  }

  /**************************
   * ROLE
   **************************/
  getAllRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (response) => {
        // Exclure le rôle client
        this.roles = response.filter((role: Role) => role.name.toLowerCase() !== 'client');
      },
    });
  }

  // Civilité : options
  civiliteOptions = Object.values(Civilite).map((civ) => ({
    label: civ,
    value: civ,
  }));

  onCountryChange(event: any) {
    const selectedCountry = event.value;

    if (selectedCountry && selectedCountry === 'GUINEE-CONAKRY') {
      this.isGuineeSelected = true;
      this.user.adresse.code_postal = '00224';
    } else {
      this.isGuineeSelected = false;
      this.user.adresse.ville = '';
      this.user.adresse.quartier = '';
      this.user.adresse.code_postal = '';
    }
  }

  saveUser() {
    this.submitted = true;
    this.errors = {};

    const isGuinee = this.isGuineeSelected;

    if (
      !this.user.role_name ||
      !this.user.civilite ||
      !this.user.nom_complet ||
      !this.user.email ||
      !this.user.phone ||
      !this.user.password ||
      !this.user.password_confirmation ||
      !this.user.adresse?.pays
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires.',
        life: 3000,
      });
      return;
    }

    // Normalisation simple
    this.user.adresse.pays = String(this.user.adresse.pays);
    if (!isGuinee && this.user.adresse.code_postal) {
      this.user.adresse.code_postal = String(this.user.adresse.code_postal);
    }

    this.loading = true; // démarre le spinner du bouton

    this.userService.createEmploye(this.user)
      .pipe(finalize(() => this.loading = false)) // stoppe toujours le spinner
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'User créé avec succès',
            life: 3000,
          });

          this.user = new User();
          this.submitted = false;
          this.errors = {};

          this.router.navigate(['/dashboard/user']);
        },
        error: (err) => {
          console.error('Erreur lors de la création du user:', err);
          if (err.error && err.error.errors) {
            this.errors = err.error.errors;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Création du user échouée. Vérifiez les champs.',
            life: 5000,
          });
        },
      });
  }
}
