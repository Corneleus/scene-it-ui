// src/app/shared/header/header.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Needed for ngModel

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule // ✅ Add this
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  searchQuery = '';

  onSearch(event: Event) {
    event.preventDefault();
    console.log('Search query:', this.searchQuery);
    // Optional: You can route to a search page or filter movies here
  }
}
