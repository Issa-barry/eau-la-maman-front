import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';


import { VehiculeDetailRoutingModule } from './vehicule-detail-routing.module';
import { VehiculeDetailComponent } from './vehicule-detail.component';


@NgModule({
  declarations: [
    VehiculeDetailComponent
  ],
  imports: [
    CommonModule,
    VehiculeDetailRoutingModule,
    FormsModule,
        ButtonModule,
        RippleModule,
        InputTextModule,
        DropdownModule,
        FileUploadModule,
        InputTextareaModule,
        InputGroupModule,
        InputGroupAddonModule,
        DividerModule,
        ReactiveFormsModule,
        ToastModule
  ]
})
export class VehiculeDetailModule { }
