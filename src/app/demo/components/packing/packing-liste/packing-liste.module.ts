import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';

import { PackingListeRoutingModule } from './packing-liste-routing.module';
import { PackingListeComponent } from './packing-liste.component';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';


@NgModule({
  declarations: [
    PackingListeComponent
  ],
  imports: [
    CommonModule,
    PackingListeRoutingModule,
    TableModule,
		FileUploadModule,
		FormsModule,
		ButtonModule, 
		RippleModule,
		ToastModule, 
		ToolbarModule,
		RatingModule,
		InputTextModule,
		InputTextareaModule,
		DropdownModule,
		RadioButtonModule,
		InputNumberModule,
		DialogModule,
		TagModule,
		ChipModule,
		BadgeModule
  ]
})
export class PackingListeModule { }
