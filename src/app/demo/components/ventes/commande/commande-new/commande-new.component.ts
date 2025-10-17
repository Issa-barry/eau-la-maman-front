import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CommandeService, ApiErrorShape } from 'src/app/demo/service/ventes/commande/commande.service';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { VehiculeService } from 'src/app/demo/service/vehicule/vehicule.service';

import { Produit } from 'src/app/demo/models/produit.model';
import { CreateCommandeDto } from 'src/app/demo/models/commande-create.dto';
import { Vehicule } from 'src/app/demo/models/vehicule.model';

@Component({
  selector: 'app-commande-new',
  templateUrl: './commande-new.component.html',
  styleUrls: ['./commande-new.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class CommandeNewComponent implements OnInit {
  // Lignes de commande
  lignes: { produit: Produit | null; quantite: number; prix_vente: number }[] = [];

  // Totaux & réduction
  reduction = 0;
  totalCommande = 0;
  totalBrut = 0;

  // Sélection véhicule (au lieu du livreur)
  selectedVehicule: Vehicule | null = null;
  vehicules: Vehicule[] = [];
  matriculeQuery = '';

  // Données annexes
  produits: Produit[] = [];

  // États
  loading = false;
  isSaving = false;

  // Erreurs
  errorMessage = '';
  apiErrors: { [key: string]: string[] } = {};

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

  // ---------- Recherche distante des véhicules par immatriculation ----------
  searchVehicules(): void {
    const q = this.matriculeQuery?.trim();
    if (!q || q.length < 2) {
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
        this.vehicules = list || [];
        if (this.vehicules.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Aucun résultat',
            detail: 'Aucun véhicule trouvé pour cette immatriculation.',
          });
        }
        this.loading = false;
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
      next: (data) => (this.produits = data),
      error: (err: ApiErrorShape) => {
        this.errorMessage = err?.message || 'Erreur lors du chargement des produits.';
        this.messageService.add({ severity: 'error', summary: `Erreur ${err?.status ?? ''}`.trim(), detail: this.errorMessage });
      },
    });
  }

  // ---------- Lignes ----------
  ajouterLigne(): void {
    this.lignes.push({ produit: null, quantite: 1, prix_vente: 0 });
  }

  supprimerLigne(index: number): void {
    this.lignes.splice(index, 1);
    this.recalculerTotal();
  }

  onProduitChange(index: number): void {
    const produit = this.lignes[index].produit;
    if (produit && produit.prix_vente !== undefined) {
      this.lignes[index].prix_vente = Number(produit.prix_vente) || 0;
    }
    this.recalculerTotal();
  }

  // ---------- Totaux ----------
  recalculerTotal(): void {
    const brut = this.lignes.reduce((total, ligne) => {
      const quantite = Number(ligne.quantite) || 0;
      const prix = Number(ligne.prix_vente) || 0;
      return total + quantite * prix;
    }, 0);
    this.totalBrut = brut;
    this.totalCommande = brut - (Number(this.reduction) || 0);
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
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez sélectionner un véhicule.' });
      return;
    }

    if (lignesValides.length === 0) {
      this.apiErrors['lignes.0.produit_id'] = ['Sélectionnez un produit.'];
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Ajoutez au moins un produit.' });
      return;
    }

    const lignesPayload = lignesValides.map((ligne) => ({
      produit_id: ligne.produit!.id!,
      quantite: Number(ligne.quantite) || 0,
      prix_vente: Number(ligne.prix_vente) || 0,
    }));

    // NOTE: si CreateCommandeDto n’a pas encore vehicule_id, on caste en any.
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
