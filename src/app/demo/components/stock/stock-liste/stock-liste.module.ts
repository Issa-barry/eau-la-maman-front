import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChartModule } from 'primeng/chart';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { StockListeRoutingModule } from './stock-liste-routing.module';
import { StockListeComponent } from './stock-liste.component';
import { PipeModule } from 'src/app/demo/pipes/pipe.module';


@NgModule({
  declarations: [
    StockListeComponent
  ],
  imports: [
    CommonModule,
    StockListeRoutingModule,
      ButtonModule,
        RippleModule,
        TagModule,
        TooltipModule,
        TableModule,
        InputNumberModule,
        ChartModule,
        PipeModule
  ]
})
export class StockListeModule { }
