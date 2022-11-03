import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAdminPhoneComponent } from './user-admin-phone.component';

describe('UserAdminPhoneComponent', () => {
  let component: UserAdminPhoneComponent;
  let fixture: ComponentFixture<UserAdminPhoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAdminPhoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAdminPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
