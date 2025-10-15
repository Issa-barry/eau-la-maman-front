import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeNewComponent } from './vehicule-new.component';

describe('VehiculeNewComponent', () => {
  let component: VehiculeNewComponent;
  let fixture: ComponentFixture<VehiculeNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehiculeNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VehiculeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
