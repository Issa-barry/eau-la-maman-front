import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgenceNewRoutingModule } from './agence-new-routing.module';
import { AgenceNewComponent } from './agence-new.component';
 import { FormsModule } from '@angular/forms';
import { ProfileCreateRoutingModule } from '../../profile/create/profilecreate-routing.module';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';

@NgModule({
    declarations: [AgenceNewComponent],
    imports: [
        CommonModule,
        AgenceNewRoutingModule,
        FormsModule,
        ProfileCreateRoutingModule,
        ButtonModule,
        RippleModule,
        InputTextModule,
        DropdownModule,
        FileUploadModule,
        InputTextareaModule,
        InputGroupModule,
        InputGroupAddonModule,
        PasswordModule,
        ToastModule,
        ProgressSpinnerModule,
        CalendarModule,
        TableModule
    ],
})
export class AgenceNewModule {}
