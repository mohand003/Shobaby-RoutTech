import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Cart, CartWithProducts, CartProduct } from '../types/cart.interface';
import { Product } from '../types/product.interface';
import { ProductsService } from './products.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_BASE = 'https://fakestoreapi.com';
  private cartSubject = new BehaviorSubject<CartWithProducts | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  cart$ = this.cartSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private productsService: ProductsService,
    private authService: AuthService
  ) {
    this.loadCartFromStorage();
    
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn && this.authService.currentUser) {
        this.getUserCart(this.authService.currentUser.id);
      } else {
        this.cartSubject.next(null);
        localStorage.removeItem('cart');
      }
    });
  }

  private loadCartFromStorage(): void {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData) as CartWithProducts;
        this.cartSubject.next(cart);
      } catch (e) {
        localStorage.removeItem('cart');
      }
    }
  }

  getUserCart(userId: number): Observable<CartWithProducts> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Cart[]>(`${this.API_BASE}/carts/user/${userId}`).pipe(
      map(carts => carts.length > 0 ? carts[carts.length - 1] : null),
      switchMap(cart => {
        if (cart) {
          return this.enrichCartWithProducts(cart);
        } else {
          return this.createCart(userId, []);
        }
      }),
      tap(cart => {
        this.cartSubject.next(cart);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  private createCart(userId: number, products: CartProduct[]): Observable<CartWithProducts> {
    const payload = {
      userId,
      date: new Date().toISOString(),
      products
    };
    return this.http.post<Cart>(`${this.API_BASE}/carts`, payload).pipe(
      switchMap(cart => this.enrichCartWithProducts(cart))
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<CartWithProducts> {
    if (!this.authService.isLoggedIn) {
      return throwError(() => new Error('Please log in to add items to your cart'));
    }
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }

    return this.http.get<Cart[]>(`${this.API_BASE}/carts/user/${userId}`).pipe(
      map(carts => carts.length > 0 ? carts[carts.length - 1] : null),
      switchMap(cart => {
        let products: CartProduct[];
        if (cart) {
          const idx = cart.products.findIndex(p => p.productId === productId);
          if (idx >= 0) {
            products = cart.products.map(p =>
              p.productId === productId
                ? { ...p, quantity: p.quantity + quantity }
                : p
            );
          } else {
            products = [...cart.products, { productId, quantity }];
          }
          return this.http.put<Cart>(`${this.API_BASE}/carts/${cart.id}`, {
            userId,
            date: new Date().toISOString(),
            products
          }).pipe(
            switchMap(updatedCart => this.enrichCartWithProducts(updatedCart))
          );
        } else {
          return this.createCart(userId, [{ productId, quantity }]);
        }
      }),
      tap(cart => {
        this.cartSubject.next(cart);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  removeFromCart(productId: number): Observable<CartWithProducts> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Cart[]>(`${this.API_BASE}/carts/user/${userId}`).pipe(
      map(carts => carts.length > 0 ? carts[carts.length - 1] : null),
      switchMap(cart => {
        if (!cart) {
          return throwError(() => new Error('Cart not found'));
        }
        const products = cart.products.filter(p => p.productId !== productId);
        return this.http.put<Cart>(`${this.API_BASE}/carts/${cart.id}`, {
          userId,
          date: new Date().toISOString(),
          products
        }).pipe(
          switchMap(updatedCart => this.enrichCartWithProducts(updatedCart))
        );
      }),
      tap(cart => {
        this.cartSubject.next(cart);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateQuantity(productId: number, quantity: number): Observable<CartWithProducts> {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Cart[]>(`${this.API_BASE}/carts/user/${userId}`).pipe(
      map(carts => carts.length > 0 ? carts[carts.length - 1] : null),
      switchMap(cart => {
        if (!cart) {
          return throwError(() => new Error('Cart not found'));
        }
        const products = cart.products.map(p =>
          p.productId === productId ? { ...p, quantity } : p
        );
        return this.http.put<Cart>(`${this.API_BASE}/carts/${cart.id}`, {
          userId,
          date: new Date().toISOString(),
          products
        }).pipe(
          switchMap(updatedCart => this.enrichCartWithProducts(updatedCart))
        );
      }),
      tap(cart => {
        this.cartSubject.next(cart);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  clearCart(): Observable<CartWithProducts> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Cart[]>(`${this.API_BASE}/carts/user/${userId}`).pipe(
      map(carts => carts.length > 0 ? carts[carts.length - 1] : null),
      switchMap(cart => {
        if (!cart) {
          return throwError(() => new Error('Cart not found'));
        }
        return this.http.put<Cart>(`${this.API_BASE}/carts/${cart.id}`, {
          userId,
          date: new Date().toISOString(),
          products: []
        }).pipe(
          switchMap(updatedCart => this.enrichCartWithProducts(updatedCart))
        );
      }),
      tap(cart => {
        this.cartSubject.next(cart);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.loadingSubject.next(false);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  private enrichCartWithProducts(cart: Cart): Observable<CartWithProducts> {
    if (!cart.products.length) {
      const emptyCart: CartWithProducts = {
        ...cart,
        products: [],
        totalItems: 0,
        totalPrice: 0
      };
      return of(emptyCart);
    }

    const productObservables = cart.products.map(item => 
      this.productsService.getProduct(item.productId).pipe(
        map(product => ({
          ...item,
          product
        }))
      )
    );

    return forkJoin(productObservables).pipe(
      map(productsWithDetails => {
        const totalItems = productsWithDetails.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = productsWithDetails.reduce(
          (sum, item) => sum + (item.product.price * item.quantity), 0
        );

        return {
          ...cart,
          products: productsWithDetails,
          totalItems,
          totalPrice
        };
      })
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
          errorMessage = 'Cart not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }
    
    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}