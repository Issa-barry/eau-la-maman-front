import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UpdateCommandeDto } from 'src/app/demo/models/commande-update.dto';
import { Commande } from 'src/app/demo/models/commande.model';
import { Produit } from 'src/app/demo/models/produit.model';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { CommandeService, ApiErrorShape } from 'src/app/demo/service/ventes/commande/commande.service';
import { forkJoin } from 'rxjs';
import { Vehicule } from 'src/app/demo/models/vehicule.model';
import { VehiculeService } from 'src/app/demo/service/vehicule/vehicule.service';

@Component({
  selector: 'app-commande-detail',
  templateUrl: './commande-detail.component.html',
  styleUrls: ['./commande-detail.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class CommandeDetailComponent implements OnInit {
  titrePage = 'Détail de la commande';
  isEditMode = false;

  errorMessage = '';
  apiErrors: { [key: string]: string[] } = {};

  produits: Produit[] = [];
  vehicules: Vehicule[] = [];
  commande: Commande = new Commande();
  lignes: { produit: Produit | null; quantite: number; prix_vente: number }[] = [];

  reduction = 0;
  totalCommande = 0;
  totalBrut = 0;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private vehiculeService: VehiculeService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const numero = this.activatedRoute.snapshot.params['id'];

    // Charger produits + véhicules avant la commande
    forkJoin({
      produits: this.produitService.getProduits(),
      vehicules: this.vehiculeService.getAll(),
    }).subscribe({
      next: ({ produits, vehicules }) => {
        this.produits = produits;
        this.vehicules = vehicules.data;
        this.loadCommande(numero);
      },
      error: (err: ApiErrorShape) => this.showError(err, 'Erreur lors du chargement des référentiels.'),
    });
  }

  /** Charge la commande par numéro et mappe les données */
  private loadCommande(numero: string): void {
    this.commandeService.getCommandeByNumero(numero).subscribe({
      next: (res) => {
        this.commande = res;
        this.mapCommande(res);
      },
      error: (err: ApiErrorShape) => this.showError(err, 'Erreur lors du chargement de la commande.'),
    });
  }

  /** Mappe la commande reçue du back vers le modèle front */
  private mapCommande(res: Commande): void {
    // Associe le véhicule complet depuis la liste
    this.commande.vehicule = this.vehicules.find(v => v.id === res.vehicule?.id) || res.vehicule;

    // Montant / réduction
    this.reduction = parseFloat(res.reduction as any) || 0;

    // Lignes de commande
    this.lignes = (res.lignes || []).map((l: any) => {
      const produitTrouve = this.produits.find(p => p.id === l.produit?.id);
      return {
        produit: produitTrouve || l.produit,
        quantite: +l.quantite_commandee || 0,
        prix_vente: +l.prix_vente || 0,
      };
    });

    this.recalculerTotal();
    this.titrePage = `Détail de la commande : ${res.numero}`;
  }

  /** Recalcul du total commande */
  recalculerTotal(): void {
    const brut = this.lignes.reduce((total, l) => total + (l.quantite || 0) * (l.prix_vente || 0), 0);
    this.totalBrut = brut;
    this.totalCommande = brut - (this.reduction || 0);
  }

  /** Bascule en édition */
  editProduct(): void {
    this.isEditMode = true;
    this.titrePage = `Modification de la commande : ${this.commande.numero}`;
  }

  /** Annule l'édition */
  cancelEdit(): void {
    this.isEditMode = false;
    this.apiErrors = {};
    this.errorMessage = '';
    this.loadCommande(this.commande.numero);
  }

  /** Enregistrement de la commande */
  saveCommande(): void {
    this.apiErrors = {};
    this.errorMessage = '';

    const payload: UpdateCommandeDto = {
      vehicule_id: this.commande.vehicule?.id!,
      reduction: this.reduction,
      lignes: this.lignes.map(l => ({
        produit_id: l.produit?.id!,
        quantite: l.quantite,
        prix_vente: l.prix_vente,
      })),
    } as any;

    this.commandeService.updateCommande(this.commande.numero, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande mise à jour avec succès.' });
        this.isEditMode = false;
        this.loadCommande(this.commande.numero);
      },
      error: (err: ApiErrorShape) => this.showError(err, 'Erreur lors de la mise à jour.'),
    });
  }

  /** Suppression de la commande */
  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette commande ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.commandeService.deleteCommande(this.commande.numero).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande supprimée avec succès.' });
            setTimeout(() => this.router.navigate(['/dashboard/ventes/commande']), 1500);
          },
          error: (err: ApiErrorShape) => this.showError(err, 'La suppression a échoué.'),
        });
      },
    });
  }

  /** Validation de commande */
  validerCommandeDetail(): void {
    if (!this.commande?.numero) return;

    this.confirmationService.confirm({
      message: 'Valider cette commande ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.commandeService.validerCommande(this.commande.numero).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande validée avec succès.' });
            this.loadCommande(this.commande.numero);
          },
          error: (err: ApiErrorShape) => this.showError(err, 'Échec de la validation.'),
        });
      },
    });
  }

  /** Quand on change de produit dans une ligne (dropdown) */
  onProduitChange(index: number): void {
    const p = this.lignes[index]?.produit;
    if (p && p.prix_vente != null) {
      this.lignes[index].prix_vente = +(<any>p.prix_vente);
    }
    this.recalculerTotal();
  }

  // --- Helpers ---
  private showError(err: ApiErrorShape, fallback: string): void {
    this.errorMessage = err?.message || fallback;
    this.apiErrors = err?.errors || {};
    this.messageService.add({
      severity: 'error',
      summary: `Erreur ${err?.status ?? ''}`.trim(),
      detail: this.errorMessage,
    });
    console.error(fallback, err);
  }

  trackByLigne(index: number): number {
    return index;
  }

  private statusKey(raw?: string): string {
    return raw?.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_') || '';
  }

  get isDraft(): boolean {
    return this.statusKey(this.commande?.statut) === 'brouillon';
  }

  get isDelivered(): boolean {
    const k = this.statusKey(this.commande?.statut);
    return ['livre', 'paye', 'cloture'].includes(k);
  }

  get isLivraisonAccessible(): boolean {
    return this.statusKey(this.commande?.statut) !== 'brouillon';
  }

  onGoToLivraisonDetail(): void {
    this.router.navigate(['/dashboard/stock/livraison/livraison-detail', this.commande.numero]);
  }

  getError(field: string, index?: number): string | null {
    const key = index !== undefined ? `lignes.${index}.${field}` : field;
    const msgs = this.apiErrors?.[key];
    return Array.isArray(msgs) && msgs.length ? msgs[0] : null;
  }

  hasError(field: string, index?: number): boolean {
    return !!this.getError(field, index);
  }
}
