import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../types/user.interface';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  signupForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor() {
    this.signupForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: [''],
    });

    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.markFormGroupTouched(this.signupForm);
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = this.signupForm.value;

    const userData = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      name: {
        firstname: formData.firstname,
        lastname: formData.lastname
      },
      phone: formData.phone,
      address: {
        city: '',
        street: '',
        number: 0,
        zipcode: '',
        geolocation: {
          lat: '0',
          long: '0'
        }
      }
    };

    this.authService.signup(userData).subscribe({
      next: (user: User) => {
        this.isLoading = false;
        console.log('Signup successful:', user);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = err.message || 'Signup failed. Please try again.';
        console.error('Signup error:', err);
      }
    });
  }

  demoSignup(): void {
    this.isLoading = true;
    this.error = null;

    const demoUserData = {
      email: 'demo@example.com',
      username: 'demouser',
      password: 'demo123',
      name: {
        firstname: 'Demo',
        lastname: 'User'
      },
      phone: '555-0123'
    };

    this.authService.demoSignup(demoUserData).subscribe({
      next: (user) => {
        this.isLoading = false;
        console.log('Demo signup successful:', user);
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.error = err.message || 'Demo signup failed. Please try again.';
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}
