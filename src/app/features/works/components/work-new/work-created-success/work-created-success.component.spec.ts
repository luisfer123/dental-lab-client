import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkCreatedSuccessComponent } from './work-created-success.component';

describe('WorkCreatedSuccessComponent', () => {
  let component: WorkCreatedSuccessComponent;
  let fixture: ComponentFixture<WorkCreatedSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WorkCreatedSuccessComponent]
    });
    fixture = TestBed.createComponent(WorkCreatedSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
