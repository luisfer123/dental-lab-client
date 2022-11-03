import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './user/profile/profile.component';
import { SideMenuComponent } from './user/side-menu/side-menu.component';
import { EditProfileComponent } from './user/edit-profile/edit-profile.component';
import { AuthErrorInterceptor } from './_security/auth.error.interceptor';
import { AddressTypePipe } from './_pipes/address-type.pipe';
import { PhoneTypePipe } from './_pipes/phone-type.pipe';
import { UserAdminAddressComponent } from './user/user-admin-address/user-admin-address.component';
import { UserAdminPhoneComponent } from './user/user-admin-phone/user-admin-phone.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    ProfileComponent,
    SideMenuComponent,
    EditProfileComponent,
    AddressTypePipe,
    PhoneTypePipe,
    UserAdminAddressComponent,
    UserAdminPhoneComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
