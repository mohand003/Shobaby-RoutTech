import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.html',
  styleUrls: ['./error-message.scss']
})
export class ErrorMessageComponent {
  @Input() message: string = 'An unexpected error occurred';
  @Output() retry = new EventEmitter<void>();
}
