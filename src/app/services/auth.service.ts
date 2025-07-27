import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { User, LoginCredentials, LoginResponse } from '../types/user.interface';
import { isPlatformBrowser } from '@angular/common';

export interface SignupData {
  username: string;
  email: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address?: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation?: {
      lat: string;
      long: string;
    };
  };
  phone?: string;
}

export interface SignupResponse {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE = 'https://fakestoreapi.com';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  
  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Only access localStorage in the browser
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData) as User;
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
        } catch (e) {
          this.logout();
        }
      }
    } else {
      // SSR: localStorage not available, handle accordingly
      this.logout();
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/auth/login`, credentials).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.token);
        }
      }),
      switchMap(() => this.getUserById(1)),
      catchError(this.handleError)
    );
  }

  signup(userData: SignupData): Observable<User> {
    return this.http.post<SignupResponse>(`${this.API_BASE}/users`, userData).pipe(
      switchMap(response => {
        const newUser: User = {
          id: response.id,
          email: userData.email,
          username: userData.username,
          password: userData.password,
          name: userData.name,
          address: userData.address ? {
            ...userData.address,
            geolocation: userData.address.geolocation || {
              lat: '0',
              long: '0'
            }
          } : {
            city: '',
            street: '',
            number: 0,
            zipcode: '',
            geolocation: {
              lat: '0',
              long: '0'
            }
          },
          phone: userData.phone || ''
        };

        const demoToken = `signup_token_${response.id}_${Date.now()}`;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', demoToken);
          localStorage.setItem('user', JSON.stringify(newUser));
        }
        
        this.currentUserSubject.next(newUser);
        this.isLoggedInSubject.next(true);
        
        return of(newUser);
      }),
      catchError(this.handleError)
    );
  }

  demoSignup(userData: SignupData): Observable<User> {
    const newUser: User = {
      id: Math.floor(Math.random() * 1000) + 100,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      name: userData.name,
      address: userData.address ? {
        ...userData.address,
        geolocation: userData.address.geolocation || {
          lat: '0',
          long: '0'
        }
      } : {
        city: 'Demo City',
        street: '123 Demo Street',
        number: 1,
        zipcode: '12345',
        geolocation: {
          lat: '0',
          long: '0'
        }
      },
      phone: userData.phone || '555-0123'
    };
    
    const demoToken = `demo_signup_token_${newUser.id}_${Date.now()}`;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    
    this.currentUserSubject.next(newUser);
    this.isLoggedInSubject.next(true);
    
    return of(newUser);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_BASE}/users/${id}`).pipe(
      tap(user => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  checkUsernameAvailability(username: string): Observable<boolean> {
    const takenUsernames = ['admin', 'test', 'user', 'johnd', 'mor_2314', 'kevinryan'];
    return of(!takenUsernames.includes(username.toLowerCase()));
  }

  checkEmailAvailability(email: string): Observable<boolean> {
    const takenEmails = ['john@gmail.com', 'test@example.com', 'admin@site.com'];
    return of(!takenEmails.includes(email.toLowerCase()));
  }

  demoLogin(): Observable<User> {
    const demoUser: User = {
      id: 1,
      email: 'john@example.com',
      username: 'johnd',
      password: 'm38rmF$',
      name: {
        firstname: 'John',
        lastname: 'Doe'
      },
      address: {
        city: 'kilcoole',
        street: '7835 new road',
        number: 3,
        zipcode: '12926-3874',
        geolocation: {
          lat: '-37.3159',
          long: '81.1496'
        }
      },
      phone: '1-570-236-7033'
    };
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', 'demo_token');
      localStorage.setItem('user', JSON.stringify(demoUser));
    }
    this.currentUserSubject.next(demoUser);
    this.isLoggedInSubject.next(true);
    
    return of(demoUser);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Something went wrong. Please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = 'Invalid data provided. Please check your information.';
          break;
        case 401:
          errorMessage = 'Invalid username or password.';
          break;
        case 404:
          errorMessage = 'User not found.';
          break;
        case 409:
          errorMessage = 'Username or email already exists.';
          break;
        case 422:
          errorMessage = 'Validation failed. Please check your input.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  };
}