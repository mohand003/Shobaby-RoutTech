import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Product } from '../types/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly API_BASE = 'https://fakestoreapi.com';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Product[]>(`${this.API_BASE}/products`).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  getProduct(id: number): Observable<Product> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Product>(`${this.API_BASE}/products/${id}`).pipe(
      retry(2),
      catchError(this.handleError.bind(this))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_BASE}/products/categories`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse) {
    this.loadingSubject.next(false);
    
    let errorMessage = 'Something went wrong. Please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 404:
          errorMessage = 'The requested product was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }
    
    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  clearError() {
    this.errorSubject.next(null);
  }

  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }
}