import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  private sub?: Subscription;

  isLoggedIn = false;
  username = '';

  ngOnInit(): void {
    // 🟢 Escuchar cambios de usuario reactivos
    this.sub = this.auth.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user?.username ?? '';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe(); // ✅ Limpieza segura
  }

  hasRole(role: string): boolean {
    return this.auth.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.auth.hasAnyRole(roles);
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
