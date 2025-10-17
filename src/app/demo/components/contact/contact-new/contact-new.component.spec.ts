import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactNewComponent } from './contact-new.component';

describe('ContactNewComponent', () => {
  let component: ContactNewComponent;
  let fixture: ComponentFixture<ContactNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
