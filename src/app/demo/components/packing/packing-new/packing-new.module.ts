import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PackingNewRoutingModule } from './packing-new-routing.module';
import { PackingNewComponent } from './packing-new.component';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';


@NgModule({
  declarations: [
    PackingNewComponent
  ],
  imports: [
    CommonModule,
    PackingNewRoutingModule,
     FormsModule,          
        DropdownModule,       
        InputTextModule,     
        ButtonModule, 
        TableModule,  
        SkeletonModule,
        ToastModule,
  ]
})
export class PackingNewModule { }
