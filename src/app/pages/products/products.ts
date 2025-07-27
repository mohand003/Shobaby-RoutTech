import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../components/prouduct-card/prouduct-card';
import { LoadingSkeletonComponent } from '../../components/loading-skeleton/loading-skeleton';
import { ErrorMessageComponent } from '../../components/error-message/error-message';
import { ProductsService } from '../../services/products.service';
import { Product, SortOption } from '../../types/product.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    LoadingSkeletonComponent,
    ErrorMessageComponent
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class ProductsComponent {
  private productsService = inject(ProductsService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  
  searchTerm: string = '';
  selectedCategory: string = '';
  sortOption: SortOption = 'name-asc';
  
  isLoading: boolean = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    this.productsService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.sortProducts();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  filterProducts(): void {
    let filtered = [...this.products];

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(product =>
        product.category === this.selectedCategory
      );
    }

    this.filteredProducts = filtered;
    this.sortProducts();
  }

  sortProducts(): void {
    this.filteredProducts.sort((a, b) => {
      switch (this.sortOption) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortOption = 'name-asc';
    this.filterProducts();
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}
