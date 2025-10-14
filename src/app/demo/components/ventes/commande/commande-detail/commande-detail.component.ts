import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UpdateCommandeDto } from 'src/app/demo/models/commande-update.dto';
import { Commande } from 'src/app/demo/models/commande.model';
 import { Produit } from 'src/app/demo/models/produit.model';
 import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { CommandeService, ApiErrorShape } from 'src/app/demo/service/ventes/commande/commande.service';
import { forkJoin } from 'rxjs';
import { User } from 'src/app/demo/models/User';
import { UserService } from 'src/app/demo/service/users/user.service';

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
  users: User[] = [];
  commande: Commande = new Commande();
  numeroCommande: string = this.activatedRoute.snapshot.params['id'];

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
    private userService: UserService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Charge produits et users en parallèle, puis la commande
    forkJoin({
      produits: this.produitService.getProduits(),
      users: this.userService.getUser(),
    }).subscribe({
      next: ({ produits, users }) => {
        this.produits = produits;
        this.users = users;
        this.loadCommande(); // ensuite seulement on charge la commande
      },
      error: (err: ApiErrorShape) => {
        this.errorMessage = err?.message || 'Erreur lors du chargement des référentiels.';
        this.messageService.add({
          severity: 'error',
          summary: `Erreur ${err?.status ?? ''}`.trim(),
          detail: this.errorMessage,
        });
      },
    });
  }

  private mapCommande(res: Commande) {
    this.commande = res;

    // User
    this.commande.user = this.users.find((c) => c.id === res.user?.id);

    // Réduction
    this.reduction = parseFloat(res.reduction as any) || 0;

    // Lignes
    this.lignes = (res.lignes || []).map((l: any) => {
      const produitTrouve = this.produits.find((p) => p.id === l.produit?.id);
      return {
        produit: produitTrouve || null,
        quantite: parseInt(l.quantite_commandee) || 0,
        prix_vente: parseFloat(l.prix_vente) || 0,
      };
    });

    this.recalculerTotal();
    this.titrePage = `Détail de la commande : ${res.numero}`;
  }

  loadCommande(): void {
    this.commandeService.getCommandeByNumero(this.numeroCommande).subscribe({
      next: (res) => this.mapCommande(res),
      error: (err: ApiErrorShape) => {
        this.errorMessage = err?.message || 'Erreur lors du chargement de la commande.';
        this.messageService.add({
          severity: 'error',
          summary: `Erreur ${err?.status ?? ''}`.trim(),
          detail: this.errorMessage,
        });
      },
    });
  }

  ajouterLigne(): void {
    this.lignes.push({ produit: null, quantite: 1, prix_vente: 0 });
  }

  supprimerLigne(index: number): void {
    this.lignes.splice(index, 1);
    this.recalculerTotal();
  }

  onProduitChange(index: number): void {
    const produit = this.lignes[index].produit;
    if (produit?.prix_vente) {
      this.lignes[index].prix_vente = parseFloat(produit.prix_vente as any);
    }
    this.recalculerTotal();
  }

  recalculerTotal(): void {
    const brut = this.lignes.reduce((total, ligne) => {
      const quantite = ligne.quantite || 0;
      const prix = ligne.prix_vente || 0;
      return total + quantite * prix;
    }, 0);
    this.totalBrut = brut;
    this.totalCommande = brut - (this.reduction || 0);
  }

  editProduct(): void {
    this.isEditMode = true;
    this.titrePage = `Modification de la commande : ${this.commande.numero}`;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.apiErrors = {};
    this.errorMessage = '';
    this.loadCommande();
  }

  saveCommande(): void {
    // reset état erreurs
    this.apiErrors = {};
    this.errorMessage = '';

    const payload: UpdateCommandeDto = {
      user_id: this.commande.user?.id!, 
      reduction: this.reduction,
      lignes: this.lignes.map((ligne) => ({
        produit_id: ligne.produit?.id!,
        quantite: ligne.quantite,
        prix_vente: ligne.prix_vente,
      })),
    };

    this.commandeService.updateCommande(this.commande.numero, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Commande mise à jour avec succès.',
        });
        this.isEditMode = false;
        this.loadCommande();
      },
      error: (err: ApiErrorShape) => {
        // Erreurs validation (422) => champs
        this.apiErrors = (err?.errors as any) || {};
        // Message global (403/500/…) => bandeau + toast
        this.errorMessage = err?.message || 'Erreur lors de la mise à jour.';

        this.messageService.add({
          severity: 'error',
          summary: `Erreur ${err?.status ?? ''}`.trim(),
          detail: this.errorMessage,
        });

        // Si 403 (ex: commande déjà livrée), on reste en lecture seule
        if (err?.status === 403) {
          this.isEditMode = false;
        }

        console.error('Erreur update commande:', err);
      },
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette commande ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.commandeService.deleteCommande(this.commande.numero).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Commande supprimée avec succès.',
              life: 3000,
            });
            setTimeout(() => {
              this.router.navigate(['/dashboard/ventes/commande']);
            }, 1500);
          },
          error: (err: ApiErrorShape) => {
            this.messageService.add({
              severity: 'error',
              summary: `Erreur ${err?.status ?? ''}`.trim(),
              detail: err?.message || 'La suppression a échoué.',
            });
            console.error('Erreur suppression commande:', err);
          },
        });
      },
    });
  }

  // ---------- Helpers statut ----------
  private statusKey(raw?: string): string {
    if (!raw) return '';
    return raw
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // enlève accents
      .replace(/\s+/g, '_');           // espaces -> underscore
  }

  get isDraft(): boolean {
    return this.statusKey(this.commande?.statut) === 'brouillon';
  }

  get isDelivered(): boolean {
    const k = this.statusKey(this.commande?.statut);
    return k === 'livre' || k === 'paye' || k === 'cloture';
  }

  // ---------- Action: valider la commande depuis le détail ----------
  validerCommandeDetail(): void {
    if (!this.commande?.numero) return;

    this.confirmationService.confirm({
      message: 'Valider cette commande ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.commandeService.validerCommande(this.commande.numero).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Commande validée avec succès.',
            });
            this.loadCommande(); // rafraîchit le statut
          },
          error: (err: ApiErrorShape) => {
            this.messageService.add({
              severity: 'error',
              summary: `Erreur ${err?.status ?? ''}`.trim(),
              detail: err?.message || 'Échec de la validation.',
            });
            console.error('Erreur validation commande:', err);
          },
        });
      },
    });
  }

  // Optimize ngFor rendering of lignes
  trackByLigne(index: number, _ligne: { produit: Produit | null; quantite: number; prix_vente: number }) {
    return index;
  }

  // -------- Validation helpers (API errors) --------
  getError(field: string, index?: number): string | null {
    const key = index !== undefined ? `lignes.${index}.${field}` : field;
    const msgs = this.apiErrors?.[key];
    return Array.isArray(msgs) && msgs.length ? msgs[0] : null;
  }

  hasError(field: string, index?: number): boolean {
    return !!this.getError(field, index);
  }


  // livraison : 
  // Accès au détail livraison autorisé pour ces statuts
// get isLivraisonAccessible(): boolean {
//   const k = this.statusKey(this.commande?.statut);
//   return k === 'livraison_en_cours' || k === 'livré' || k === 'cloturé';
// }

get isLivraisonAccessible(): boolean {
  const k = this.statusKey(this.commande?.statut);
  return k !== 'brouillon';
}


// Navigation vers le détail de la livraison
onGoToLivraisonDetail(): void {
  if (!this.commande?.numero) return;
  this.router.navigate(['/dashboard/stock/livraison/livraison-detail', this.commande.numero]);
}

}
