import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { FactureService } from 'src/app/demo/service/comptabilite/facturation/facturation.service';
import { Facture } from 'src/app/demo/models/Facture';

@Component({
  selector: 'app-facturation-liste',
  standalone: false,
  templateUrl: './facturation-liste.component.html',
  styleUrl: './facturation-liste.component.scss',
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturationListeComponent implements OnInit {
  @ViewChild('filter') filter!: ElementRef<HTMLInputElement>;
 
  factures: Facture[] = [];
  loading = true;
  skeletonRows = Array(10).fill({});

  // menu filtre
  itemsFiltre: MenuItem[] = [
    { label: 'Payé', command: () => this.applyStatus('payé') },
    { label: 'Partiel', command: () => this.applyStatus('partiel') },
    { separator: true },
    { label: 'Tous', command: () => this.clearStatus() },
  ];

  expandedRows: Record<string, boolean> = {};

  constructor(
    private router: Router,
    private factureService: FactureService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFactures();
  }

  private loadFactures() {
    this.loading = true;
    
    this.factureService.getAll().subscribe({
      next: (res) => {
        this.factures = res;
        this.loading = false;
        this.cdr.markForCheck();
        // console.log('Factures chargées:', this.factures[0]?.commande?.contact);
        
      },
      error: (err) => {
        console.error('Erreur chargement factures:', err);
        this.factures = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // filtre global
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter?.nativeElement) this.filter.nativeElement.value = '';
  }

  // filtres par statut (client-side). Si besoin -> faire appel API spécifique
  private applyStatus(statut: string) {
    this.loading = true;
    this.factureService.getAll().subscribe({
      next: (list) => {
        
        
        this.factures = list.filter(
          (f) => (f.statut || '').toLowerCase() === statut.toLowerCase()
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.factures = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private clearStatus() {
    this.loadFactures();
  }

  trackById(_i: number, f: Facture) {
    return f.id ?? f.numero;
  }

  goToDetail(f?: Facture) {
    if (f?.id) {
      this.router.navigate(['/dashboard/facturation/detail', f.id]);
    } else {
      this.router.navigate(['/dashboard/facturation/detail']);
    }
  }
}
