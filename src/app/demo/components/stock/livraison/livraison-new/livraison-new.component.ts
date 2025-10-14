import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { CommandeService } from 'src/app/demo/service/ventes/commande/commande.service';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { LivraisonService } from 'src/app/demo/service/stock/livraison/livraison.service';
 
import { Produit } from 'src/app/demo/models/produit.model';
 import { Commande } from 'src/app/demo/models/commande.model';
import { Livraison } from 'src/app/demo/models/livraison.model';
import { User } from 'src/app/demo/models/User';
import { UserService } from 'src/app/demo/service/users/user.service';

interface UILigne {
  produit: Produit | null;
  prix_vente: number;             // API string -> number
  quantite_commandee: number;     // API
  quantite_restante: number;      // API (qté livrable: non affichée mais utilisée pour clamp)
  quantite_livree: number;        // saisie
}

@Component({
  selector: 'app-livraison-new',
  templateUrl: './livraison-new.component.html',
  styleUrls: ['./livraison-new.component.scss']
})
export class LivraisonNewComponent implements OnInit {
  lignes: UILigne[] = [];

  totalCommande = 0;
  commandeNumero: string = this.activatedRoute.snapshot.params['id'];

  selectedLivreur: User | null = null;
  selectedClient: User | null = null;

  produits: Produit[] = [];
  users: User[] = [];

  commande?: Commande;                 // Pour tag statut / disable bouton
  livraison: Livraison = new Livraison();

  errorMessage = '';
  apiErrors: { [key: string]: string[] } = {};
  isSaving = false;

  // Pour bordure rouge si aucune quantité à la soumission
  submitted = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private livraisonService: LivraisonService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadProduits();
    this.loadUsers();
    this.loadCommande();
  }

  // ------------------ Loaders ------------------
  loadUsers(): void {
    this.userService.getUser().subscribe({
      next: res => (this.users = res),
      error: err => {
        console.error('Erreur récupération users :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les users.',
        });
      },
    });
  }

  loadProduits(): void {
    this.produitService.getProduits().subscribe({
      next: data => (this.produits = data),
      error: err => {
        console.error('Erreur chargement produits :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les produits.',
        });
      },
    });
  }

  loadCommande(): void {
    this.commandeService.getCommandeByNumero(this.commandeNumero).subscribe({
      next: (commande: Commande | any) => {
        this.commande = commande;
        this.selectedLivreur = commande?.user ?? null;
        this.totalCommande = Number(commande?.montant_total ?? 0);

        this.lignes = (commande?.lignes ?? []).map((l: any): UILigne => ({
          produit: l?.produit ?? null,
          prix_vente: Number(l?.prix_vente ?? l?.produit?.prix_vente ?? 0),
          quantite_commandee: Number(l?.quantite_commandee ?? 0),
          quantite_restante: Number(l?.quantite_restante ?? 0),
          quantite_livree: Number(l?.quantite_livree ?? 0),
        }));
      },
      error: err => {
        console.error('Erreur chargement commande :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger la commande.',
        });
      },
    });
  }

  // ------------------ UI helpers ------------------
  onProduitChange(index: number): void {
    const p = this.lignes[index].produit;
    this.lignes[index].prix_vente = Number(p?.prix_vente) || 0;
  }

  // Clamp qté livrée par rapport à la qté livrable
  onQteLivreeChange(i: number, value: any): void {
    const max = Number(this.lignes[i].quantite_restante);
    let v = Number(value) || 0;
    if (v < 0) v = 0;
    if (Number.isFinite(max) && v > max) v = max;
    this.lignes[i].quantite_livree = v;
  }

  // Bordure rouge si champ invalide après soumission
  isQteLivreeInvalid(i: number): boolean {
    const v = Number(this.lignes[i]?.quantite_livree) || 0;
    return this.submitted && v <= 0;
  }

  getSousTotal(i: number): number {
    const l = this.lignes[i];
    return (Number(l?.quantite_livree) || 0) * (Number(l?.prix_vente) || 0);
  }

  getStatutSeverity(statut?: string): 'success' | 'info' | 'warning' | 'danger' {
    const s = (statut || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    if (s.includes('livre')) return 'success';   // livré / livree / livrée
    if (s.includes('clotur')) return 'success';  // clôturé
    if (s.includes('annul')) return 'danger';
    if (s.includes('en_cours') || s.includes('livraison') || s.includes('attente')) return 'warning';
    return 'info';
  }

  // Désactiver le bouton si commande déjà livrée/clôturée
  get isCommandeLivree(): boolean {
    const s = (this.commande?.statut || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return s.includes('livre') || s.includes('clotur');
  }

  get submitDisabled(): boolean {
    return this.isSaving || this.isCommandeLivree;
  }

  // ------------------ Submit ------------------
  onSubmit(): void {
    this.errorMessage = '';
    this.apiErrors = {};
    this.submitted = true;

    if (this.isCommandeLivree) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Déjà livrée',
        detail: 'Cette commande est déjà livrée/clôturée.',
      });
      return;
    }

    const quantiteLivreeTotale = this.lignes.reduce(
      (s, l) => s + (Number(l.quantite_livree) || 0),
      0
    );

    if (quantiteLivreeTotale <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune quantité',
        detail: 'Veuillez saisir au moins une quantité livrée.',
      });
      return;
    }

    // On utilise ton modèle, mais seul le DTO minimal sera envoyé par le service
    const req = new Livraison();
    req.date_livraison = new Date().toISOString().slice(0, 10);
    req.quantite_livree = quantiteLivreeTotale;
    if (this.selectedLivreur) req.livreur = this.selectedLivreur;

    this.isSaving = true;
    this.livraisonService.validerLivraison(this.commandeNumero, req).subscribe({
      next: () => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Livraison validée.',
        });
        this.router.navigate([
          '/dashboard/stock/livraison/livraison-detail',
          this.commandeNumero,
        ]);
      },
      error: (err) => {
  this.isSaving = false;
  console.error('Erreur validation livraison', err);

  // Le service garantit err.message + err.errors
  this.errorMessage =
    err?.message ||
    // fallback si jamais on bypassait le service
    err?.error?.message ||
    err?.error?.error ||
    'Erreur lors de la validation.';

  this.apiErrors = err?.errors || {};
  this.messageService.add({
    severity: 'error',
    summary: 'Validation échouée',
    detail: this.errorMessage
  });
}

    });
  }

  onGoToListeCommande(): void {
    this.router.navigate(['/dashboard/ventes/commande']);
  }

  // ------------------ Helpers erreurs template ------------------
  getError(field: string, index?: number): string | null {
    const key = index !== undefined ? `lignes.${index}.${field}` : field;
    const msgs = this.apiErrors?.[key];
    return Array.isArray(msgs) && msgs.length ? msgs[0] : null;
  }
  hasError(field: string, index?: number): boolean {
    return !!this.getError(field, index);
  }

  // ------------------ TrackBy ------------------
  trackByLigne(index: number, l: UILigne) {
    return l.produit?.id ?? index;
  } 
}
