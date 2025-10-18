import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Produit } from 'src/app/demo/models/produit.model';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
 import { ConfirmationService, MessageService } from 'primeng/api';
import { TypeProduitEnum } from 'src/app/demo/enums/typeProduit.enum';

@Component({
    selector: 'app-produit-detail',
    templateUrl: './produit-detail.component.html',
    styleUrls: ['./produit-detail.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class ProduitDetailComponent implements OnInit {
    produit: Produit = new Produit();
    pageTitle: string = 'Détail du produit';
    TypeProduitOptions = Object.values(TypeProduitEnum);

    apiErrors: { [key: string]: string[] } = {};
    isEditMode: boolean = false;
    isLoading: boolean = true;
    submitted: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private produitService: ProduitService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.loadProduit(id);
        }
    }

    loadProduit(id: number) {
        this.produitService.getProduitById(id).subscribe({
            next: (data) => {
                this.produit = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur lors de la récupération du produit', err),
                    (this.isLoading = false);
            },
        });
    }

    enableEditMode(): void {
        this.isEditMode = true;
        this.pageTitle = 'Modifier le produit';
    }

    cancelEditMode(): void {
        this.isEditMode = false;
        this.pageTitle = 'Détail du produit';
    }
    onSaveProduit(): void {
        this.submitted = true;
        this.apiErrors = {};

        if (!this.produit.id) {
            console.error('ID du produit manquant');
            return;
        }

        this.produitService
            .updateProduit(this.produit.id, this.produit)
            .subscribe({
                next: (res) => {
                    console.log('Produit mis à jour avec succès', res);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Produit mis à jour avec succès',
                        life: 3000,
                    });

                    this.loadProduit(this.produit.id!);
                    this.cancelEditMode();
                },
                error: (err) => {
                    console.error(
                        'Erreur lors de la mise à jour du produit',
                        err
                    );

                    if (err.status === 422 && err.error?.data) {
                        this.apiErrors = err.error.data;
                    }
                },
            });
    }

    onDeleteProduit(): void {
        if (!this.produit.id) {
            console.error('ID du produit manquant');
            return;
        }

        this.produitService.deleteProduit(this.produit.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Suppression réussie',
                    detail: 'Le produit a été supprimé.',
                    life: 3000,
                });

                this.router.navigate([
                    '/dashboard/stock/produit/produit-liste',
                ]);
            },
            error: (err) => {
                console.error('Erreur lors de la suppression du produit', err);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de supprimer le produit.',
                });
            },
        });
    }

confirmDeleteProduit(): void {
  this.confirmationService.confirm({
    message: 'Voulez-vous vraiment supprimer ce produit ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    accept: () => {
      this.onDeleteProduit();
    },
  });
}


    onGoToProduits(): void {
        this.router.navigate(['/dashboard/stock/produit/produit-liste']);
    }
}
