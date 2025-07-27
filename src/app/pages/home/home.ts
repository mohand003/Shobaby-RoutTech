import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {}
