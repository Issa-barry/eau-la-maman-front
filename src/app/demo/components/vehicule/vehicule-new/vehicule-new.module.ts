import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';

import { VehiculeNewRoutingModule } from './vehicule-new-routing.module';
import { VehiculeNewComponent } from './vehicule-new.component';
import { DividerModule } from 'primeng/divider';


@NgModule({
  declarations: [
    VehiculeNewComponent
  ],
  imports: [
    CommonModule,
    VehiculeNewRoutingModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    DropdownModule,
    FileUploadModule,
    InputTextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    DividerModule
  ]
})
export class VehiculeNewModule { }
