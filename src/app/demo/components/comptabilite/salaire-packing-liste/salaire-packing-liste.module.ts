import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RippleModule } from 'primeng/ripple';

import { SalairePackingListeRoutingModule } from './salaire-packing-liste-routing.module';
import { SalairePackingListeComponent } from './salaire-packing-liste.component';

@NgModule({
  declarations: [SalairePackingListeComponent],
  imports: [
    CommonModule,
    FormsModule,
    SalairePackingListeRoutingModule,
    ButtonModule,
    CalendarModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    InputTextModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    RippleModule
  ]
})
export class SalairePackingListeModule { }