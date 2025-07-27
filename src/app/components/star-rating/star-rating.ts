import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  imports: [CommonModule],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss'
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() count: number = 0;

  get stars(): boolean[] {
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating % 1 >= 0.5;
    const stars: boolean[] = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(true);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(true);
      } else {
        stars.push(false);
      }
    }

    return stars;
  }
}
