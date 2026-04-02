import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../models/movies.model';

@Component({
  selector: 'app-movie-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-table.component.html',
  styleUrls: ['./movie-table.component.scss']
})
export class MovieTableComponent {
  movies = input<Movie[]>([]);

  // ✅ Multi-select state (track selected movie IDs)
  selectedMovieIds = signal<Set<number>>(new Set());

  // ✅ Computed derived state for template
  selectedMovies = computed(() =>
    this.movies().filter(m => this.selectedMovieIds().has(m.movieId))
  );

  // ✅ Toggle multi-select for a movie
  selectMovie(movie: Movie): void {
    this.selectedMovieIds.update(current => {
      const updated = new Set(current);
      if (updated.has(movie.movieId)) {
        updated.delete(movie.movieId);
      } else {
        updated.add(movie.movieId);
      }
      return updated;
    });
  }

  // ✅ Check if movie is selected
  isSelected(movie: Movie): boolean {
    return this.selectedMovieIds().has(movie.movieId);
  }

  // ✅ Clear all selections
  clearSelection(): void {
    this.selectedMovieIds.set(new Set());
  }
}
