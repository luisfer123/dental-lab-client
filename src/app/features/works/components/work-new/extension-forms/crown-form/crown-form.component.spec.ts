import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrownFormComponent } from './crown-form.component';

describe('CrownFormComponent', () => {
  let component: CrownFormComponent;
  let fixture: ComponentFixture<CrownFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CrownFormComponent]
    });
    fixture = TestBed.createComponent(CrownFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
