import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Packing } from 'src/app/demo/models/packing.model';
import { PackingService } from 'src/app/demo/service/packing/packing.service';

@Component({
  selector: 'app-packing-liste',
  templateUrl: './packing-liste.component.html',
  styleUrls: ['./packing-liste.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class PackingListeComponent implements OnInit {

  packings: Packing[] = [];
  selectedPackings: Packing[] = [];
  showDetailDialog = false;
  selectedPacking: Packing | null = null;

  packingDialog: boolean = false;
  deletePackingDialog: boolean = false;
  deletePackingsDialog: boolean = false;

  packing: Packing = new Packing();
  submitted: boolean = false;

  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];

  constructor(
    private packingService: PackingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadPackings();

    this.cols = [
      { field: 'reference', header: 'Référence' },
      { field: 'employé', header: 'Employé' },
      { field: 'quantite_packed', header: 'Qté' },
      { field: 'date_packing', header: 'Date' },
      { field: 'statut', header: 'Statut' },
    ];
  }

  loadPackings(): void {
    this.packingService.getAll().subscribe({
      next: (data) => {
        this.packings = data;
        console.log(this.packings);
      },
      error: (err) => this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.message
      })
    }); 
  }

  openNew(): void {
    this.packing = new Packing();
    this.submitted = false;
    this.packingDialog = true;
  }

  deletePacking(p: Packing): void {
    this.packing = p;
    this.deletePackingDialog = true;
  }

  confirmDelete(): void {
    if (!this.packing.id) return;

    this.packingService.delete(this.packing.id).subscribe({
      next: () => {
        this.packings = this.packings.filter(p => p.id !== this.packing.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Supprimé',
          detail: 'Packing supprimé avec succès'
        });
        this.deletePackingDialog = false;
        this.packing = new Packing();
      },
      error: (err) => this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.message
      })
    });
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


  validerPackingDepuisListe(packing: Packing): void {
  if (!packing.id) return;

  this.packingService.valider(packing.id).subscribe({
    next: () => {
      packing.statut = 'validé'; // mise à jour locale
      this.messageService.add({
        severity: 'success',
        summary: 'Packing validé',
        detail: `Le packing ${packing.reference} a été validé.`
      });
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.error?.message || 'Une erreur est survenue'
      });
    }
  });
}


}
