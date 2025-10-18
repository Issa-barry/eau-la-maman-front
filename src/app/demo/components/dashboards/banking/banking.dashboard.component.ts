import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { MessageService } from 'primeng/api';

import { Contact } from 'src/app/demo/models/contact';
import { ContactService } from 'src/app/demo/service/contact/contact.service';
import { TransfertService } from 'src/app/demo/service/transfert/transfert.service';

import { EncaissementService } from 'src/app/demo/service/comptabilite/encaissement/encaissement.service';
import { CommandeService } from 'src/app/demo/service/ventes/commande/commande.service';
import { FactureService } from 'src/app/demo/service/comptabilite/facturation/facturation.service';

// ✅ Types
import { EncaissementStatsType } from 'src/app/demo/components/types/EncaissementStats.type';
import { PERIODES, Periode, PERIODE_LABELS } from 'src/app/demo/components/types/periode.type';
import { CommandeStatsType } from 'src/app/demo/components/types/CommandeStats.type';
import { FactureStatsType } from 'src/app/demo/components/types/FactureStats.type';
import { User } from 'src/app/demo/models/User';
 import { AuthService } from 'src/app/demo/service/auth/auth.service';

interface MonthlyPayment {
  name?: string;
  amount?: number;
  paid?: boolean;
  date?: string;
}

/** Sévérités PrimeNG (inline) */
type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';

/** Ligne prête pour l'UI (réutilisable pour commandes/factures) */
type RowUI = {
  statut: string;
  label: string;
  severity: TagSeverity;
  nombre: number;
  montant: number | null;
  date: string | null;
};

@Component({
  templateUrl: './banking.dashboard.component.html',
  styleUrl: './banking.dashboard.component.scss',
  providers: [MessageService],
})
export class BankingDashboardComponent implements OnInit, OnDestroy {
  // iba
  // BankingDashboardComponent.ts (ajouts)
skeletonRows = Array.from({ length: 3 }); // 3 lignes fantômes pour le tableau

    // me: User = new User();
    me$!: Observable<User | null>;
  // --------- UI / Charts ----------
  chartData: any;
  chartOptions: any;


  payments: MonthlyPayment[] = [];

  // --------- Etat global ----------
  subscription: Subscription;
  errors: { [key: string]: string } = {};
  contact: Contact = new Contact();

  // --------- Stats Encaissements ----------
  encStats?: EncaissementStatsType;
  encLoading = false;
  encError = '';

  // --------- Stats Commandes ----------
  cmdStats?: CommandeStatsType;
  cmdLoading = false;
  cmdError = '';

  // --------- Stats Factures ----------
  facStats?: FactureStatsType;
  facLoading = false;
  facError = '';

  // --------- Périodes ----------
  periodes = PERIODES;
  periode: Periode = 'aujourdhui';             // ✅ source unique
  get cmdPeriode(): Periode { return this.periode; }
  set cmdPeriode(p: Periode) { this.periode = p; }

  periodeLabel = PERIODE_LABELS;
  cmdPeriodeOptions = PERIODES.map((p) => ({ label: PERIODE_LABELS[p], value: p }));

  constructor(
    private layoutService: LayoutService,
    private contactService: ContactService,
    private messageService: MessageService,
    private transfertService: TransfertService,
    private encaissementService: EncaissementService,
    private commandeService: CommandeService,
    private factureService: FactureService,
    private authService: AuthService,
  ) {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe(() => this.initChart());
  }

  // -------------------- Lifecycle --------------------
  ngOnInit() {
     this.lodUserAuth();
    this.loadEncaissementStats();
    this.loadCommandeStats();
    this.loadFactureStats();
    this.initChart();

    // démo
    this.payments = [
      { name: 'Electric Bill', amount: 75.6, paid: true, date: '06/04/2022' },
      { name: 'Water Bill', amount: 45.5, paid: true, date: '07/04/2022' },
      { name: 'Gas Bill', amount: 45.2, paid: false, date: '12/04/2022' },
      { name: 'Internet Bill', amount: 25.9, paid: true, date: '17/04/2022' },
      { name: 'Streaming', amount: 40.9, paid: false, date: '20/04/2022' },
    ];
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }

  // -------------------- Période --------------------
  onGlobalPeriodeChange(p: Periode) {
    this.periode = p;
    this.loadEncaissementStats();
    this.loadCommandeStats();
    this.loadFactureStats();
  }
  onPeriodeChange(p: Periode) {
    this.periode = p;
    this.loadEncaissementStats();
    this.loadCommandeStats();
    this.loadFactureStats();
  }

  // -------------------- Me --------------------

   lodUserAuth() {
    this.me$ = this.authService.currentUser$;
     if (!this.authService.currentUserValue) {
      this.authService.getMe().subscribe();
    }    
  }
  getInitiales(nomComplet?: string | null): string {
  if (!nomComplet) return '?';
  const parts = nomComplet.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last  = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? '');
  return (first + last).toUpperCase();
}

  // -------------------- Encaissements --------------------
  loadEncaissementStats(): void {
    this.encLoading = true;
    this.encError = '';

    this.encaissementService.getStats({ periode: this.periode }).subscribe({
      next: (data) => { this.encStats = data; this.encLoading = false; },
      error: (err) => {
        this.encLoading = false;
        this.encError = err?.message || 'Erreur lors du chargement des encaissements.';
        this.messageService.add({ severity: 'error', summary: 'Encaissements', detail: this.encError });
      },
    });
  }

  get encCash(): number { return this.encStats?.encaissements.cash ?? 0; }
  get encOM(): number { return this.encStats?.encaissements.orange_money ?? 0; }
  get encDepot(): number { return this.encStats?.encaissements.depot_banque ?? 0; }
  get encTotal(): number { return this.encStats?.encaissements.total ?? 0; }

  // -------------------- Commandes --------------------
  loadCommandeStats() {
    this.cmdLoading = true;
    this.cmdError = '';
    this.commandeService.getStats({ periode: this.periode }).subscribe({
      next: (d) => { this.cmdStats = d; this.cmdLoading = false; },
      error: (err) => {
        this.cmdError = err?.message || 'Erreur lors du chargement des commandes.';
        this.cmdLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Commandes', detail: this.cmdError });
      },
    });
  }

  // normalisation commune (accents/espaces/traits -> _ ; minuscule)
  private normalizeStatut(key: string): string {
    return (key ?? '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_')
      .trim();
  }

  // ----- Commandes : libellés + couleurs -----
  private readonly ORDERED_CMD = ['brouillon','livraison_en_cours','livre','cloture','annule'] as const;

  private readonly KNOWN_CMD_LABEL: Record<string, string> = {
    brouillon:           'Brouillon',
    annule:              'Annulée',
    livraison_en_cours:  'En cours de livraison',
    livre:               'Livrée',
    cloture:             'Clôturée',
  };

  private readonly KNOWN_CMD_SEVERITY: Record<string, TagSeverity> = {
    brouillon:           'warning',
    annule:              'danger',
    livraison_en_cours:  'info',
    livre:               'success',
    cloture:             'secondary',
  };

  private toCmdLabel(statut: string): string {
    const k = this.normalizeStatut(statut);
    if (this.KNOWN_CMD_LABEL[k]) return this.KNOWN_CMD_LABEL[k];
    const pretty = (statut || '').replace(/_/g, ' ').trim();
    return pretty.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
  }

  private getCmdSeverity(statut: string): TagSeverity {
    const k = this.normalizeStatut(statut);
    if (this.KNOWN_CMD_SEVERITY[k]) return this.KNOWN_CMD_SEVERITY[k];
    if (k.includes('annul')) return 'danger';
    if (k.includes('brouillon') || k.includes('draft')) return 'warning';
    if (k.includes('factur') || k.includes('en_cours') || k.includes('pending') || k.includes('process')) return 'info';
    if (k.includes('livre') || k.includes('paye') || k.includes('regle') || k.includes('complete') || k.includes('done')) return 'success';
    if (k.includes('clot') || k.includes('close') || k.includes('archive')) return 'secondary';
    return 'secondary';
  }

  get commandesList(): RowUI[] {
    const by = this.cmdStats?.commandes?.par_statut as Record<string, { count: number; montant?: number }> | undefined;
    if (!by) return [];
    const rows = Object.entries(by).map(([rawKey, infos]): RowUI => ({
      statut: rawKey,
      label: this.toCmdLabel(rawKey),
      severity: this.getCmdSeverity(rawKey),
      nombre: infos?.count ?? 0,
      montant: infos?.montant ?? null,
      date: this.cmdStats?.range?.to ?? this.cmdStats?.range?.from ?? null,
    }));
    return rows.sort((a, b) => {
      const ia = this.ORDERED_CMD.indexOf(this.normalizeStatut(a.statut) as any);
      const ib = this.ORDERED_CMD.indexOf(this.normalizeStatut(b.statut) as any);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.label.localeCompare(b.label);
    });
  }

  // -------------------- Factures (par_statut : brouillon | partiel | payé | impayé) --------------------
  loadFactureStats() {
    this.facLoading = true;
    this.facError = '';
    this.factureService.getStats({ periode: this.periode }).subscribe({
      next: (d) => { this.facStats = d; this.facLoading = false; console.log('dashboard.factures', d);
      },
      error: (err) => {
        this.facError = err?.message || 'Erreur lors du chargement des factures.';
        this.facLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Factures', detail: this.facError });
      },
    });
  }

  /** Ordre d’affichage conseillé pour factures */
  private readonly ORDERED_FACT = ['brouillon','partiel','impaye','paye'] as const;

  /** Libellés officiels (avec accents) — indexés par clé normalisée */
  private readonly KNOWN_FACT_LABEL: Record<string, string> = {
    brouillon: 'Brouillon',
    partiel:   'Partiel',
    paye:      'Payé',
    impaye:    'Impayé',
  };

  /** Couleurs PrimeNG — indexées par clé normalisée */
  private readonly KNOWN_FACT_SEVERITY: Record<string, TagSeverity> = {
    brouillon: 'warning',
    partiel:   'info',
    paye:      'success',
    impaye:    'danger',
  };

  private toFactLabel(statut: string): string {
    const k = this.normalizeStatut(statut); // "payé" -> "paye", "impayé" -> "impaye"
    if (this.KNOWN_FACT_LABEL[k]) return this.KNOWN_FACT_LABEL[k];
    const pretty = (statut || '').replace(/_/g, ' ').trim();
    return pretty.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
  }

  private getFactSeverity(statut: string): TagSeverity {
    const k = this.normalizeStatut(statut);
    return this.KNOWN_FACT_SEVERITY[k] ?? 'secondary';
  }

  get facturesList(): RowUI[] {
    // back: { factures: { total_ttc, montant_du_total, par_statut: { 'brouillon'| 'partiel'| 'payé'| 'impayé': { count, total_ttc } } } }
    const ps = (this.facStats as any)?.factures?.par_statut as Record<string, { count: number; total_ttc?: number }> | undefined;
    if (!ps) return [];
    const date = this.facStats?.range?.to ?? this.facStats?.range?.from ?? null;

    const rows = Object.entries(ps).map(([rawKey, val]): RowUI => ({
      statut: rawKey,
      label: this.toFactLabel(rawKey),
      severity: this.getFactSeverity(rawKey),
      nombre: Number(val?.count ?? 0),
      montant: Number(val?.total_ttc ?? 0),
      date,
    }));

    return rows.sort((a, b) => {
      const ia = this.ORDERED_FACT.indexOf(this.normalizeStatut(a.statut) as any);
      const ib = this.ORDERED_FACT.indexOf(this.normalizeStatut(b.statut) as any);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.label.localeCompare(b.label);
    });
  }

  // partagée
  trackByStatut = (_: number, row: RowUI) => this.normalizeStatut(row.statut);

  // -------------------- Chart --------------------
  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Income',
          data: [6500, 5900, 8000, 8100, 5600, 5500, 4000],
          fill: false,
          tension: 0.4,
          borderColor: documentStyle.getPropertyValue('--green-500'),
        },
        {
          label: 'Expenses',
          data: [1200, 5100, 6200, 3300, 2100, 6200, 4500],
          fill: true,
          borderColor: '#6366f1',
          tension: 0.4,
          backgroundColor: 'rgba(99,102,220,0.2)',
        },
      ],
    };

    this.chartOptions = {
      animation: { duration: 0 },
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
      },
    };
  }
}
