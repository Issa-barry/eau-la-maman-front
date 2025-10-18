import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProduitService } from 'src/app/demo/service/produit/produit.service';
import { Produit } from 'src/app/demo/models/produit.model';
import {  TypeProduitEnum } from 'src/app/demo/enums/typeProduit.enum';

@Component({
  selector: 'app-produit-new',
  templateUrl: './produit-new.component.html',
  styleUrls: ['./produit-new.component.scss']
})
export class ProduitNewComponent {
  @ViewChildren('buttonEl') buttonEl!: QueryList<ElementRef>;

  produit: Produit = new Produit();
  submitted: boolean = false;
  apiErrors: { [key: string]: string[] } = {};
  errorMessage: string = '';

  uploadedFiles: any[] = [];
  categoryOptions = Object.values(TypeProduitEnum);
  showRemove: boolean = false;

  constructor(
    private produitService: ProduitService,
    private router: Router
  ) {}

  onUpload(event: any) {
    const file: File = event.files[0];

    if (file) {
      this.produit.image = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.produit['imagePreview'] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.produit.image = '';
  }

  saveProduit() {
    this.submitted = true;
    this.apiErrors = {};
    this.errorMessage = '';

    this.produitService.createProduit(this.produit).subscribe({
      next: (produit: Produit) => {
        const newId = produit.id;
        if (newId) {
          this.router.navigate(['/dashboard/stock/produit/produit-detail', newId]);
        } else {
          this.router.navigate(['/dashboard/stock/produit/produit-liste']);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création du produit', err.error?.data);

        if (err.error && err.error.data) {
          this.apiErrors = err.error.data;
        }

        this.errorMessage = err.error?.message || 'Une erreur est survenue.';
      }
    }); 
  }

  onGoToProduits() {
    this.router.navigate(['/dashboard/stock/produit/produit-liste']);
  }
}
