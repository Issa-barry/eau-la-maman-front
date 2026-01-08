import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalairePackingDetailComponent } from './salaire-packing-detail.component';

describe('SalairePackingDetailComponent', () => {
  let component: SalairePackingDetailComponent;
  let fixture: ComponentFixture<SalairePackingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalairePackingDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalairePackingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
