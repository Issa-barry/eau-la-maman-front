import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { BlockUIModule } from 'primeng/blockui';

import { SalairePackingDetailRoutingModule } from './salaire-packing-detail-routing.module';
import { SalairePackingDetailComponent } from './salaire-packing-detail.component';

@NgModule({
  declarations: [
    SalairePackingDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SalairePackingDetailRoutingModule,
    // PrimeNG
    ButtonModule,
    CalendarModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    BlockUIModule
  ]
})
export class SalairePackingDetailModule { }