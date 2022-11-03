import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAdminAddressComponent } from './user-admin-address.component';

describe('UserAdminAddressComponent', () => {
  let component: UserAdminAddressComponent;
  let fixture: ComponentFixture<UserAdminAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAdminAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAdminAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
