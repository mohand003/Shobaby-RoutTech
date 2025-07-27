import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from '../../types/product.interface';
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { StarRatingComponent } from '../../components/star-rating/star-rating';
import { ErrorMessageComponent } from '../../components/error-message/error-message';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent, ErrorMessageComponent],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.scss']
})
export class ProductDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  product: Product | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  quantity: number = 1;
  isAddingToCart: boolean = false;
  showSuccessMessage: boolean = false;
  cartItemCount: number = 0;

  private subscriptions = new Subscription();

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        const id = +params['id'];
        if (id) {
          this.loadProduct(id);
        }
      })
    );

    this.subscriptions.add(
      this.cartService.cart$.subscribe(cart => {
        this.cartItemCount = cart?.totalItems || 0;
      })
    );

    this.subscriptions.add(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        if (!isLoggedIn) {
          this.cartItemCount = 0;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProduct(id?: number): void {
    const productId = id || +this.route.snapshot.params['id'];
    this.isLoading = true;
    this.error = null;

    this.subscriptions.add(
      this.productsService.getProduct(productId).subscribe({
        next: (product) => {
          this.product = product;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message || 'Failed to load product';
          this.isLoading = false;
        }
      })
    );
  }

  increaseQuantity(): void {
    if (this.quantity < 10) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.isLoggedIn || !this.product) {
      return;
    }

    this.isAddingToCart = true;
    
    this.subscriptions.add(
      this.cartService.addToCart(this.product.id, this.quantity).subscribe({
        next: () => {
          this.isAddingToCart = false;
          this.showSuccessMessage = true;
          
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);

          this.quantity = 1;
        },
        error: (error) => {
          this.isAddingToCart = false;
          this.error = error.message || 'Failed to add product to cart';
          
          setTimeout(() => {
            this.error = null;
          }, 5000);
        }
      })
    );
  }

  addToWishlist(): void {
    if (!this.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    alert('Wishlist functionality will be implemented in a future update!');
  }

  shareProduct(): void {
    if (this.product && navigator.share) {
      navigator.share({
        title: this.product.title,
        text: this.product.description,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Product URL copied to clipboard!');
      }).catch(() => {
        alert('Unable to copy URL. Please copy manually: ' + window.location.href);
      });
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/placeholder-product.png';
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
