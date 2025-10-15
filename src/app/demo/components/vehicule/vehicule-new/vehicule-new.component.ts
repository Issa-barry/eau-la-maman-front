import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vehicule-new',
  templateUrl: './vehicule-new.component.html',
  styleUrl: './vehicule-new.component.scss'
})
export class VehiculeNewComponent implements OnInit { 

    countries: any[] = [];

    ngOnInit() {
        this.countries = [
            {name: 'Australia', code: 'AU'},
            {name: 'Brazil', code: 'BR'},
            {name: 'China', code: 'CN'},
            {name: 'Egypt', code: 'EG'},
            {name: 'France', code: 'FR'},
            {name: 'Germany', code: 'DE'},
            {name: 'India', code: 'IN'},
            {name: 'Japan', code: 'JP'},
            {name: 'Spain', code: 'ES'},
            {name: 'United States', code: 'US'}
        ]; 
    }
    
}