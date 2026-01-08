import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalaireVenteDetailRoutingModule } from './salaire-vente-detail-routing.module';
import { SalaireVenteDetailComponent } from './salaire-vente-detail.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { BlockUIModule } from 'primeng/blockui';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';


@NgModule({
  declarations: [
    SalaireVenteDetailComponent
  ],
  imports: [
    CommonModule,
    SalaireVenteDetailRoutingModule,
    FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        DropdownModule,
        CalendarModule,
        InputTextModule,
        InputNumberModule,
        AutoCompleteModule,
        TableModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule,
        BlockUIModule,
        ToastModule,
        DialogModule
  ]
})
export class SalaireVenteDetailModule { }
