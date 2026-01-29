import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent {
  // Navbar collapse signal
  isCollapsed = signal(true);

  // Search input signal
  searchQuery = signal('');

  // Emits search string to parent component (optional)
  @Output() searchSubmit = new EventEmitter<string>();

  // Toggle navbar on small screens
  toggleNavbar() {
    this.isCollapsed.update(v => !v);
  }

  // Called on form submit
  onSearch(event: Event) {
    event.preventDefault();
    const query = this.searchQuery().trim();
    if (query) {
      console.log('Search:', query);
      this.searchSubmit.emit(query);
    }
  }

  // Updates searchQuery signal as user types
  updateSearch(value: string) {
    this.searchQuery.set(value);
  }
}
