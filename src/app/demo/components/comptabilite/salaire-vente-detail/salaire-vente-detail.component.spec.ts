import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaireVenteDetailComponent } from './salaire-vente-detail.component';

describe('SalaireVenteDetailComponent', () => {
  let component: SalaireVenteDetailComponent;
  let fixture: ComponentFixture<SalaireVenteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalaireVenteDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalaireVenteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
