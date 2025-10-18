import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

interface MonthlyPayment {
    name?: string;
    amount?: number;
    paid?: boolean;
    date?: string;
}

@Component({
  selector: 'app-stock-liste',
  templateUrl: './stock-liste.component.html',
  styleUrl: './stock-liste.component.scss'
})
export class StockListeComponent implements OnInit, OnDestroy {chartData: any;
  
      chartOptions: any; 
  
      payments: MonthlyPayment[] = [];
  
      subscription: Subscription;
  
      constructor(private layoutService: LayoutService) {
          this.subscription = this.layoutService.configUpdate$
              .pipe(debounceTime(25))
              .subscribe((config) => {
                  this.initChart();
              });
      }
  
      ngOnInit() {
          this.initChart(); 
  
          this.payments = [
              {
                  name: 'Pack-30',
                  amount: 1050000,
                  paid: true,
                  date: '1345',
              },
              {
                  name: 'Rouleau',
                  amount: 9000500,
                  paid: false,
                  date: '548',
              },
              {
                  name: 'Veste de pluie',
                  amount: 2547855,
                  paid: true,
                  date: '6',
              }, 
          ];
      }
  
      initChart() {
          const documentStyle = getComputedStyle(document.documentElement);
          const textColor = documentStyle.getPropertyValue('--text-color');
          const textColorSecondary = documentStyle.getPropertyValue(
              '--text-color-secondary'
          );
          const surfaceBorder =
              documentStyle.getPropertyValue('--surface-border');
  
          this.chartData = {
              labels: [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
              ],
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
              animation: {
                  duration: 0,
              },
              plugins: {
                  legend: {
                      labels: {
                          color: textColor,
                      },
                  },
                  tooltip: {
                      callbacks: {
                          label: function (context: any) {
                              let label = context.dataset.label || '';
  
                              if (label) {
                                  label += ': ';
                              }
  
                              if (context.parsed.y !== null) {
                                  label += new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: 'USD',
                                  }).format(context.parsed.y);
                              }
                              return label;
                          },
                      },
                  },
              },
              scales: {
                  x: {
                      ticks: {
                          color: textColorSecondary,
                      },
                      grid: {
                          color: surfaceBorder,
                      },
                  },
                  y: {
                      ticks: {
                          color: textColorSecondary,
                      },
                      grid: {
                          color: surfaceBorder,
                      },
                  },
              },
          };
      }
  
      ngOnDestroy(): void {
          if (this.subscription) {
              this.subscription.unsubscribe();
          }
      }

} 