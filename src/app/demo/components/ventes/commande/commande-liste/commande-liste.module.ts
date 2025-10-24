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
import { MultiSelectModule } from 'primeng/multiselect';

import { CommandeListeRoutingModule } from './commande-liste-routing.module';
import { CommandeListeComponent } from './commande-liste.component';
import { MessageModule } from 'primeng/message';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { PipeModule } from 'src/app/demo/pipes/pipe.module';


@NgModule({
  declarations: [
    CommandeListeComponent
  ],
  imports: [
    CommonModule,
    CommandeListeRoutingModule,
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
        MultiSelectModule,
        MessageModule,
        ConfirmPopupModule,
        ConfirmDialogModule,
        SkeletonModule,
        TagModule,
        PipeModule
  ]
})
export class CommandeListeModule { }
