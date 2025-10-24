import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CommandeService, ApiErrorShape } from 'src/app/demo/service/ventes/commande/commande.service';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { VehiculeService } from 'src/app/demo/service/vehicule/vehicule.service';

import { Produit } from 'src/app/demo/models/produit.model';
import { CreateCommandeDto } from 'src/app/demo/models/commande-create.dto';
import { Vehicule } from 'src/app/demo/models/vehicule.model';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-commande-new',
  templateUrl: './commande-new.component.html',
  styleUrls: ['./commande-new.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class CommandeNewComponent implements OnInit {
  // Lignes de commande
  lignes: { produit: Produit | null; quantite: number; prix_usine: number; prix_vente: number }[] = [];
  @ViewChild('firstProduit', { read: Dropdown }) firstProduitDd?: Dropdown;

  // Dropdown véhicule (pour fermer/ouvrir le panneau)
  @ViewChild('vehiculeDd', { read: Dropdown }) vehiculeDd?: Dropdown;

  // Totaux & réduction
  reduction = 0;
  totalCommande = 0;
  totalBrut = 0;

  // Sélection véhicule
  selectedVehicule: Vehicule | null = null;
  vehicules: Vehicule[] = [];

  // Recherche
  matriculeQuery: string = '';

  // Données annexes
  produits: Produit[] = [];

  // États
  loading = false;
  isSaving = false;

  // Erreurs
  errorMessage = '';
  apiErrors: { [key: string]: string[] } = {};

  // Debounce pour la recherche dans le panneau
  private filterTimer?: any;
  private lastFilter = '';

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private vehiculeService: VehiculeService,
  ) {}

  ngOnInit(): void {
    this.loadProduits();
    this.ajouterLigne();
  }

  // ---------- Utils ----------
  /** Normalise l'immatriculation (supprime espaces/traits/points et met en minuscule) */
  private normalizeImmat(v: string | null | undefined): string {
    return (v || '').toLowerCase().replace(/[\s\-.]/g, '').trim();
  }

  /** Donne le focus au premier dropdown Produit */
  private focusProduit(): void {
    setTimeout(() => this.firstProduitDd?.focus(), 0);
  }

  panelSearch(): void {
    const q = (this.matriculeQuery || '').trim();
    if (q.length < 2) {
      this.messageService.add({
        severity: 'info',
        summary: 'Recherche',
        detail: 'Saisissez au moins 2 caractères de l’immatriculation.',
      });
      return;
    }

    this.loading = true;
    this.vehiculeService.searchByImmatriculation(q).subscribe({
      next: (list) => {
        this.loading = false;
        this.vehicules = list || [];
        this.selectedVehicule = null; // laisser l'utilisateur choisir
      },
      error: (err: ApiErrorShape) => {
        this.loading = false;
        this.errorMessage = err?.message || 'Erreur lors de la recherche des véhicules.';
        this.messageService.add({
          severity: 'error',
          summary: `Erreur ${err?.status ?? ''}`.trim(),
          detail: this.errorMessage,
        });
      },
    });
  }

  // Ouvre la fiche véhicule (adapte l’URL à ton routing)
  openVehiculeDetail(v: Vehicule): void {
    if (!v || !v.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Véhicule',
        detail: 'Identifiant du véhicule manquant.',
      });
      return;
    }
    this.router.navigate(['/dashboard/vehicule/vehicule-detail/', v.id]);
  }

  /** Nettoie l'erreur et passe le focus au produit si un véhicule vient d'être choisi */
  onVehiculePicked(): void {
    if (this.apiErrors?.['vehicule_id']) delete this.apiErrors['vehicule_id'];
    this.focusProduit();
  }

  /** Ouverture du panneau : si on a déjà un filtre, on recharge (utile en retour panneau) */
  onVehiculePanelShow(): void {
    if (this.lastFilter && this.lastFilter.length >= 2 && this.vehicules.length === 0) {
      this.fetchVehicules(this.lastFilter, /*autoPick*/ false);
    }
  }

  /** Frappe dans le filtre intégré du dropdown véhicule */
  onVehiculeFilter(e: { filter?: string }): void {
    const q = (e?.filter || '').trim();
    this.lastFilter = q;

    clearTimeout(this.filterTimer);
    if (q.length < 2) {
      this.vehicules = [];
      return;
    }
    this.filterTimer = setTimeout(() => this.fetchVehicules(q, /*autoPick*/ true), 250);
  }

  /** Appel API + auto-sélection si 1 résultat ou match exact */
  private fetchVehicules(q: string, autoPick: boolean): void {
    this.loading = true;
    this.vehiculeService.searchByImmatriculation(q).subscribe({
      next: (list) => {
        this.loading = false;
        this.vehicules = list || [];

        if (!autoPick) return;

        // Un seul résultat -> auto
        if (this.vehicules.length === 1) {
          this.selectedVehicule = this.vehicules[0];
          this.onVehiculePicked();
          this.vehiculeDd?.hide();
          return;
        }

        // Plusieurs résultats -> match exact
        const nq = this.normalizeImmat(q);
        const exact = this.vehicules.find(v => this.normalizeImmat(v.immatriculation) === nq);
        if (exact) {
          this.selectedVehicule = exact;
          this.onVehiculePicked();
          this.vehiculeDd?.hide();
        }
      },
      error: (err: ApiErrorShape) => {
        this.loading = false;
        this.errorMessage = err?.message || 'Erreur lors de la recherche des véhicules.';
        this.messageService.add({
          severity: 'error',
          summary: `Erreur ${err?.status ?? ''}`.trim(),
          detail: this.errorMessage,
        });
      },
    });
  }

  // ---------- Chargements ----------
  loadProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
      },
      error: (err: ApiErrorShape) => {
        this.errorMessage = err?.message || 'Erreur lors du chargement des produits.';
        this.messageService.add({
          severity: 'error',
          summary: `Erreur ${err?.status ?? ''}`.trim(),
          detail: this.errorMessage,
        });
      },
    });
  }

  // ---------- Lignes ----------
  ajouterLigne(): void {
    this.lignes.push({ produit: null, quantite: 1, prix_vente: 0, prix_usine: 0 });
  }

  supprimerLigne(index: number): void {
    this.lignes.splice(index, 1);
    this.recalculerTotal();
  }

  onProduitChange(index: number): void {
    const produit = this.lignes[index].produit;

    if (produit) {
      const pv = Number((produit as any).prix_vente ?? 0) || 0;
      const pu = Number((produit as any).prix_usine ?? 0);

      // prix de vente : ce qu'on facture
      this.lignes[index].prix_vente = pv;

      // prix usine : référence/coût (si non fourni, on ne force pas)
      if (!this.lignes[index].prix_usine || this.lignes[index].prix_usine === 0) {
        this.lignes[index].prix_usine = Number.isFinite(pu) && pu > 0 ? pu : this.lignes[index].prix_usine;
      }
    } 

    this.recalculerTotal();
  }

  // ---------- Totaux (basés sur prix_vente) ----------
  recalculerTotal(): void {
    const brutVente = this.lignes.reduce((total, ligne) => {
      const quantite = Number(ligne.quantite) || 0;
      const prixVente = Number(ligne.prix_vente) || 0;
      return total + quantite * prixVente;
    }, 0);

    this.totalBrut = brutVente;
    this.totalCommande = brutVente - (Number(this.reduction) || 0);
  }

  // ---------- Navigation ----------
  onGoToListeCommande(): void {
    this.router.navigate(['/dashboard/ventes/commande']);
  }

  // ---------- Soumission ----------
  onSubmit(): void {
    this.resetErrors();

    const lignesValides = this.lignes.filter((l) => l.produit !== null);

    if (!this.selectedVehicule) {
      this.apiErrors['vehicule_id'] = ['Le véhicule est requis.'];
      this.messageService.add({
        severity: 'warn',
        summary: 'Champs requis',
        detail: 'Veuillez sélectionner un véhicule.',
      });
      return;
    }

    if (lignesValides.length === 0) {
      this.apiErrors['lignes.0.produit_id'] = ['Sélectionnez un produit.'];
      this.messageService.add({
        severity: 'warn',
        summary: 'Champs requis',
        detail: 'Ajoutez au moins un produit.',
      });
      return;
    }

    // (Optionnel) garde simple : empêcher un prix de vente < prix usine
    // for (let i = 0; i < lignesValides.length; i++) {
    //   const l = lignesValides[i];
    //   if ((Number(l.prix_vente) || 0) < (Number(l.prix_usine) || 0)) {
    //     this.messageService.add({
    //       severity: 'warn',
    //       summary: 'Prix incohérent',
    //       detail: `La ligne ${i + 1} a un prix de vente inférieur au prix usine.`,
    //     });
    //     return;
    //   }
    // }

    const lignesPayload = lignesValides.map((ligne) => ({
      produit_id: ligne.produit!.id!,
      quantite: Number(ligne.quantite) || 0,
      // ✅ on envoie le prix de vente (celui facturé)
      prix_vente: Number(ligne.prix_vente || 0),
      // si besoin un jour : prix_usine: Number(ligne.prix_usine || 0),
    }));

    const payload: Partial<CreateCommandeDto> & { vehicule_id: number; lignes: any[] } = {
      vehicule_id: this.selectedVehicule!.id!,
      reduction: Number(this.reduction) || 0,
      lignes: lignesPayload,
    } as any;

    this.isSaving = true;
    this.commandeService.createCommandeImedia(payload as any).subscribe({
      next: () => {
        this.isSaving = false;
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande créée avec succès.' });
        this.router.navigate(['/dashboard/ventes/commande']);
      },
      error: (err: ApiErrorShape) => {
        this.isSaving = false;
        this.apiErrors = (err?.errors as any) || {};
        this.errorMessage = err?.message || 'Données invalides';
        this.messageService.add({
          severity: 'error',
          summary: `Erreur ${err?.status ?? ''}`.trim(),
          detail: this.errorMessage,
        });
        console.error('Erreur création commande:', err);
      },
    });
  }

  // ---------- Helpers erreurs ----------
  getError(field: string, index?: number): string | null {
    const key = index !== undefined ? `lignes.${index}.${field}` : field;
    const msgs = this.apiErrors?.[key];
    return Array.isArray(msgs) && msgs.length ? msgs[0] : null;
  }

  hasError(field: string, index?: number): boolean {
    return !!this.getError(field, index);
  }

  private resetErrors(): void {
    this.errorMessage = '';
    this.apiErrors = {};
  }
}
 