import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string = '';
  password: string = '';

  passwordUpdatedFlag: boolean = false;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.passwordUpdatedFlag = params['password_updated'] === 'true';
    })
  }

  onSubmit() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: data => {
          const url = this.activatedRoute.snapshot.queryParams['requestedUrl'];
          this.router.navigateByUrl(url);
        }
      });
  }

}
