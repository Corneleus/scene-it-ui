import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieTableComponent } from './features/movies/movie-table/movie-table.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',

  // Standalone root component (Angular 21 standard)
  standalone: true,

  // Import only what this component actually uses
  imports: [
    RouterModule, // Enables <router-outlet>
    HeaderComponent,
    CommonModule,
    FooterComponent,
    MovieTableComponent
],

  // Root layout template
  templateUrl: './app.html',

  // Global app styles
  styleUrls: ['./app.scss']
})
export class AppComponent {

  /**
   * Reactive search state using Angular Signals
   * This can be shared with routes or passed to components
   */
  searchQuery = signal('');

  /**
   * Called when the HeaderComponent emits a search event
   */
  onSearch(query: string) {
    this.searchQuery.set(query);
  }
}
