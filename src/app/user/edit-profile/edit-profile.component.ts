import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { User } from 'src/app/_model/User';
import { HelperService } from 'src/app/_services/helper.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  user: User | null = null;
  profilePicture: SafeResourceUrl = '';

  fullNameForm: FormGroup;

  constructor(
    private userService: UserService,
    private helperService: HelperService,
    private router: Router
  ) { 
    this.fullNameForm = new FormGroup({
      'firstName': new FormControl(null),
      'middleName': new FormControl(null),
      'lastName': new FormControl(null),
      'secondLastName': new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  onUpdateFullName() {
    if(this.user?.id == null) {
      this.router.navigate(['/profile']);
    } else {
      this.userService.updateUserFullName(this.user.id, this.fullNameForm.value)
        .subscribe({
          next: userUpdated => {
            this.user = User.fromData(userUpdated);
          },
          error: err => console.log(err)      
        });
    }
  }

  loadData() {
    this.userService.selectedUser.subscribe({
      next: selectedUser => {
        if(selectedUser == null) {
          this.router.navigate(['/profile']);
        } else {
          this.user = selectedUser;
          this.profilePicture = this.helperService.sanitizeImage(selectedUser?.profilePicture);
          this.populateFullNameForm();
        }
      }
    });
  }

  populateFullNameForm() {
    this.fullNameForm.patchValue({
      'firstName': this.user?.firstName,
      'middleName': this.user?.middleName,
      'lastName': this.user?.lastName,
      'secondLastName': this.user?.secondLastName,
    });
  }

}
