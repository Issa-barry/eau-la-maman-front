import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturationListeRoutingModule } from './facturation-liste-routing.module';

import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { TableDemoRoutingModule } from '../../uikit/table/tabledemo-routing.module';
import { FacturationListeComponent } from './facturation-liste.component';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { PipeModule } from 'src/app/demo/pipes/pipe.module';
 

@NgModule({
  declarations: [FacturationListeComponent],
  imports: [
    CommonModule,
    FacturationListeRoutingModule,
    TableDemoRoutingModule,
		FormsModule,
		TableModule,
		RatingModule,
		ButtonModule,
		SliderModule,
		InputTextModule,
		ToggleButtonModule,
		RippleModule,
		MultiSelectModule,
		DropdownModule, 
		ProgressBarModule,
		ToastModule,
    ToolbarModule,
    FileUploadModule,
    SplitButtonModule,
    SkeletonModule,
	PipeModule
  ]
})
export class FacturationListeModule { }
 