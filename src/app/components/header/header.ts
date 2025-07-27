import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  isDarkMode$ = this.themeService.isDarkMode$;
  isLoggedIn$ = this.authService.isLoggedIn$;

  isMobileMenuOpen = false;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  login(): void {
    window.location.href = '/login';
  }

  logout(): void {
    this.authService.logout();
  }
}
