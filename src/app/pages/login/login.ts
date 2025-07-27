import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) return;
    
    this.isLoading = true;
    this.error = null;
    
    const credentials = this.loginForm.value;
    
    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.error = err.message;
      }
    });
  }
  
  demoLogin(): void {
    this.isLoading = true;
    this.error = null;
    
    this.authService.demoLogin().subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.error = err.message;
      }
    });
  }
  
  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
