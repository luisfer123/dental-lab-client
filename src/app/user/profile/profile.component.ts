import { Component, OnInit } from '@angular/core';
import {  SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Address } from 'src/app/_model/Address';
import { User } from 'src/app/_model/User';
import { AuthService } from 'src/app/_services/auth.service';
import { HelperService } from 'src/app/_services/helper.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User | null = null;
  profilePicture: SafeResourceUrl = '';
  defaultAddress: Address | null = null;
  addresses: Array<Address> = new Array();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const userId: number | null = 
      this.authService.principalValue == null ? null : this.authService.principalValue.id;

    if(userId ==  null) {
      this.authService.logout().subscribe({
        next: _ => this.router.navigate(['login'])
      });
    } else {
      this.userService.getUserById(userId).subscribe({
        next: data => {
          this.userService.getUserById(userId).subscribe({
            next: data => {
              this.user = User.fromData(data);
              this.profilePicture = this.helperService.sanitizeImage(data.profilePicture);
              this.separateDefaultAddress(this.user.addresses);
            }
          });
        }
      });
    }
  }

  onEditProfile() {
    this.userService.selectedUser.next(this.user);
    this.router.navigate(['edit-profile']);
  }

  separateDefaultAddress(addresses: Array<Address>): void {
    addresses.forEach(address => {
      if(address.defaultAddress === true) {
        this.defaultAddress = address;
      } else {
        this.addresses.push(address);
      }
    });
  }

}
