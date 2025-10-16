import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
 import { VehiculeTypeEnum } from 'src/app/demo/enums/vehicule-type.enum';
import { Vehicule } from 'src/app/demo/models/vehicule.model';
import { VehiculeService } from 'src/app/demo/service/vehicule/vehicule.service';

type StatutVehicule = 'active' | 'attente' | 'bloque' | 'archive';


@Component({
  selector: 'app-vehicule-detail',
  templateUrl: './vehicule-detail.component.html',
  styleUrl: './vehicule-detail.component.scss',
    providers: [MessageService],
   
})
export class VehiculeDetailComponent implements OnInit{
  loading = false;
  submitted = false;
   @Input() vehicule: Vehicule = new Vehicule();
     id: number = this.activatedRoute.snapshot.params['id'];

       errors: { [key: string]: string } = {};

  // Dropdowns
  types = [
    { label: 'Camion', value: VehiculeTypeEnum.Camion },
    { label: 'Fourgonette', value: VehiculeTypeEnum.Fourgonette },
    { label: 'Tricycle', value: VehiculeTypeEnum.Tricycle },
  ];
  statuts = [
    { label: 'Active', value: 'active' as StatutVehicule },
    { label: 'En attente', value: 'attente' as StatutVehicule },
    { label: 'Bloqué', value: 'bloque' as StatutVehicule },
    { label: 'Archivé', value: 'archive' as StatutVehicule },
  ];

  // Reactive form
  form = this.fb.group({
    // Véhicule
    immatriculation: ['', [Validators.required, Validators.maxLength(60)]],
    type: [null as VehiculeTypeEnum | null, [Validators.required]],
    nom: [null as string | null, [Validators.maxLength(120)]],
    statut: ['active' as StatutVehicule, [Validators.required]],

    // Propriétaire
    nom_proprietaire: ['', [Validators.required, Validators.maxLength(120)]],
    prenom_proprietaire: ['', [Validators.required, Validators.maxLength(120)]],
    phone_proprietaire: ['', [Validators.required, Validators.maxLength(30)]],

    // Livreur
    nom_livreur: ['', [Validators.required, Validators.maxLength(120)]],
    prenom_livreur: ['', [Validators.required, Validators.maxLength(120)]],
    phone_livreur: ['', [Validators.required, Validators.maxLength(30)]],
  });

  apiErrors: Record<string, string> = {};

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private toast: MessageService,
    private activatedRoute: ActivatedRoute
  ) {}
    ngOnInit(): void {
     this.loadVehicule();
  }

  loadVehicule() {
    if (this.id) {
      this.loading = true;
      this.vehiculeService.getById(this.id).subscribe({
        next: (vehicule) => {
          this.vehicule = vehicule;
          this.loading = false;
          console.log(this.vehicule);
          
        },
        error: (err) => {
          console.error('Erreur de chargement :', err);
          this.loading = false;
        },
      });
    }
  }
  submit() {
    this.apiErrors = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    } else if (!this.vehicule.id) return;

    this.loading = true;

    const payload = this.form.getRawValue();
    this.vehiculeService.update(this.id, payload as any).subscribe({
      next: (vehicule) => {
        this.loading = false;
        this.loadVehicule();
        this.toast.add({
          severity: 'success',
          summary: 'Créé',
          detail: `Véhicule ${vehicule.immatriculation} créé.`,
        });
        // Option: reset ou redirection
        this.form.reset({
          type: null,
          statut: 'active',
        });
      },
      error: (err: Error) => {
        this.loading = false;
        // essaie d’extraire les erreurs champ par champ si possible
        try {
          const parsed = JSON.parse((err.message ?? '{}').toString());
          if (parsed && typeof parsed === 'object') this.apiErrors = parsed;
        } catch {}
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message,
        });
      },
    });
  }

  hasError(ctrl: string, type: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.errors?.[type]);
  }
}
