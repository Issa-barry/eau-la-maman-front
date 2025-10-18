import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChartModule } from 'primeng/chart';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BankingDashboardComponent } from './banking.dashboard.component';
import { BankingDashboardRoutingModule } from './banking.dashboard-routing.module';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/pipes/shared.module';
import { SkeletonModule } from 'primeng/skeleton';
 
@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        RippleModule,
        TagModule,
        TooltipModule,
        TableModule,
        InputNumberModule,
        ChartModule,
        BankingDashboardRoutingModule,
        DropdownModule,
        FormsModule,
        SharedModule,
        SkeletonModule,
        TableModule,
        
    ],
    declarations: [BankingDashboardComponent],
    providers: [ ]
})
export class BankingDashboardModule { }
