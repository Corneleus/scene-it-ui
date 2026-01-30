import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule for ngModel

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // <-- Include FormsModule
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Holds the search input value
  searchQuery = '';

  // Triggered when the search form is submitted
  onSearch() {
    console.log('Search query:', this.searchQuery);
    // You can emit an event or filter your movie list here
  }
}
