import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateFrPipe } from './date-fr.pipe'; // pipe standalone
import { PhoneFormatPipe } from './phone-format.pipe';
import { MoneyPipe } from './money.pipe';

@NgModule({
  imports: [
    CommonModule,
    DateFrPipe,   // on l’importe
    PhoneFormatPipe,
    MoneyPipe
  ],
  exports: [
    CommonModule,
    DateFrPipe,   // on le ré-exporte
    PhoneFormatPipe,
    MoneyPipe
  ],
})
export class PipeModule {}
