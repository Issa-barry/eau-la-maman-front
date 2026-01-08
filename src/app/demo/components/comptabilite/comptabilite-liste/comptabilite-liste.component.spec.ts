import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptabiliteListeComponent } from './comptabilite-liste.component';

describe('ComptabiliteListeComponent', () => {
  let component: ComptabiliteListeComponent;
  let fixture: ComponentFixture<ComptabiliteListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComptabiliteListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComptabiliteListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
