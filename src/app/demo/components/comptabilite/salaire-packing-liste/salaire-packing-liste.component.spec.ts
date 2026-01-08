import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalairePackingListeComponent } from './salaire-packing-liste.component';

describe('SalairePackingListeComponent', () => {
  let component: SalairePackingListeComponent;
  let fixture: ComponentFixture<SalairePackingListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalairePackingListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalairePackingListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
