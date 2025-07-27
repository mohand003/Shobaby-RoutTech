import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartWithProducts } from '../../types/cart.interface';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CartComponent {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  cart: CartWithProducts | null = null;
  isLoading = true;
  error: string | null = null;
  isLoggedIn = false;

  ngOnInit(): void {
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;

        if (isLoggedIn && this.authService.currentUser) {
          this.loadUserCart();
        } else {
          this.cart = null;
          this.isLoading = false;
          this.error = null;
        }
      });

    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart: CartWithProducts | null) => {
        this.cart = cart;
        if (this.isLoggedIn) {
          this.isLoading = false;
        }
      });

    this.cartService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading: boolean) => {
        if (this.isLoggedIn) {
          this.isLoading = loading;
        }
      });

    this.cartService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: any) => {
        this.error = error;
      });

    if (this.authService.isLoggedIn && this.authService.currentUser) {
      this.loadUserCart();
    } else {
      this.isLoading = false;
    }
  }

  private loadUserCart(): void {
    if (this.authService.currentUser) {
      this.isLoading = true;
      this.cartService.getUserCart(this.authService.currentUser.id).subscribe({
        error: (err) => {
          this.error = err.message || 'Failed to load cart';
          this.isLoading = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByProductId(index: number, item: any): number {
    return item.productId;
  }

  incrementQuantity(productId: number): void {
    const item = this.cart?.products.find(p => p.productId === productId);
    if (item && item.quantity < 99) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  decrementQuantity(productId: number): void {
    const item = this.cart?.products.find(p => p.productId === productId);
    if (item && item.quantity > 1) {
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  onQuantityInputChange(productId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);

    if (isNaN(value) || value < 1) {
      input.value = '1';
    } else if (value > 99) {
      input.value = '99';
    }
  }

  validateAndUpdateQuantity(productId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let quantity = parseInt(input.value);

    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
    } else if (quantity > 99) {
      quantity = 99;
    }

    input.value = quantity.toString();
    this.updateQuantity(productId, quantity);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;

    this.isLoading = true;
    this.cartService.updateQuantity(productId, quantity).subscribe({
      error: (err) => {
        this.error = err.message || 'Failed to update quantity';
        this.isLoading = false;
      }
    });
  }

  removeItem(productId: number): void {
    // Optional: Add confirmation for expensive items
    const item = this.cart?.products.find(p => p.productId === productId);
    if (item && item.product.price > 100) {
      if (!confirm(`Are you sure you want to remove "${item.product.title}" from your cart?`)) {
        return;
      }
    }

    this.isLoading = true;
    this.cartService.removeFromCart(productId).subscribe({
      error: (err) => {
        this.error = err.message || 'Failed to remove item';
        this.isLoading = false;
      }
    });
  }

  clearCart(): void {
    if (this.cart && this.cart.products.length > 0) {
      if (confirm('Are you sure you want to clear your entire cart?')) {
        this.isLoading = true;
        this.cartService.clearCart().subscribe({
          error: (err) => {
            this.error = err.message || 'Failed to clear cart';
            this.isLoading = false;
          }
        });
      }
    }
  }

  checkout(): void {
    if (this.cart && this.cart.products.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  clearError(): void {
    this.error = null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/placeholder-product.png';
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}
