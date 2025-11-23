import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkNewComponent } from './work-new.component';

describe('WorkNewComponent', () => {
  let component: WorkNewComponent;
  let fixture: ComponentFixture<WorkNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WorkNewComponent]
    });
    fixture = TestBed.createComponent(WorkNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
