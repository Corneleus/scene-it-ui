import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from './movies.service';
import { Movie } from '../../models/movies.model';


@Component({
  standalone: true,
  selector: 'app-movies',
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss'],
  imports: [CommonModule, ]
})
export class MoviesPage {
  movies = signal<Movie[]>([]);
  filteredMovies = signal<Movie[]>([]);
  searchQuery = signal(''); // connected to header
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private movieService: MovieService) {
    this.loadMovies();

    // Re-filter whenever searchQuery or movies change
    effect(() => {
      const query = this.searchQuery().toLowerCase();
      const allMovies = this.movies();
      if (!query) {
        this.filteredMovies.set(allMovies);
      } else {
        this.filteredMovies.set(
          allMovies.filter(m => m.title?.toLowerCase().includes(query))
        );
      }
    });
  }

  loadMovies(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.movieService.getMovies().subscribe({
      next: data => {
        this.movies.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load movies');
        this.isLoading.set(false);
      }
    });
  }

  // Called from header when search is submitted
  onSearch(query: string) {
    this.searchQuery.set(query);
  }
}
