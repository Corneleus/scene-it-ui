
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from './movies.model';
import { MovieService } from './movies.service';

@Component({
  standalone: true,
  selector: 'app-movies',
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss'],
  imports: [CommonModule]
})
export class MoviesPage {
  // state
  movies = signal<Movie[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private movieService: MovieService) {
    this.loadMovies();
  }

  loadMovies(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.movieService.getMovies().subscribe({
      next: (data) => {
        this.movies.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load movies');
        this.isLoading.set(false);
      }
    });
  }

  searchOmdb(query: string): void {
    if (!query.trim()) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.movieService.searchOmdbApi(query).subscribe({
      next: (data) => {
        this.movies.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('OMDb search failed');
        this.isLoading.set(false);
      }
    });
  }
}
