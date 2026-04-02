import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../models/movies.model';
import { MovieTableComponent } from '../movie-table/movie-table.component';
import { AddMovie } from '../add-movie/add-movie';
import { MovieService } from '../movies.service';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [
    CommonModule,
    MovieTableComponent,
    AddMovie
],
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss']
})
export class MoviesPage {
  private readonly movieService = inject(MovieService);

  /** Signal for movies array */
  movies = signal<Movie[]>([]);

  /** Signal for loading state */
  loading = signal(true);

  constructor() {
    this.fetchMovies();
  }

  /** Fetch movies from backend API */
  fetchMovies(): void {
    this.loading.set(true);
    this.movieService.getAllMovies().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
