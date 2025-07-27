import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.scss'
})
export class LoadingSkeletonComponent {
  @Input() count: number = 8;

  get skeletonArray(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}
