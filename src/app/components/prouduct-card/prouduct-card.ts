import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StarRatingComponent } from '../star-rating/star-rating';
import { Product } from '../../types/product.interface';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  templateUrl: './prouduct-card.html',
  styleUrl: './prouduct-card.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
}
