import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../movies.service';
import { Movie } from '../../../models/movies.model';

@Component({
  selector: 'app-movie-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-table.component.html',
  styleUrls: ['./movie-table.component.scss'],
  providers: [MovieService]
})
export class MovieTableComponent implements OnInit {

  // ✅ Accept movies from parent component
  @Input() movies: Movie[] = [];

  // ✅ Internal signal for reactive movies list
  private _movies = signal<Movie[]>([]);

  // ✅ Multi-select state (track selected movie IDs)
  selectedMovieIds = signal<Set<number>>(new Set());

  // ✅ Computed derived state for template
  selectedMovies = computed(() =>
    this._movies().filter(m => this.selectedMovieIds().has(m.movieId))
  );

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    console.log('🔥 MovieTableComponent INIT');

    // Use parent-provided movies if present; otherwise load from API
    if (this.movies.length) {
      this._movies.set(this.movies);
    } else {
      this.loadMovies();
    }
  }

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

  // ✅ Load movies from API
  private loadMovies(): void {
    this.movieService.getAllMovies().subscribe({
      next: (data) => this._movies.set(data),
      error: (err) => console.error('⚠️ Error loading movies:', err)
    });
  }

  // ✅ Expose movies signal for template
  get movies$(): Movie[] {
    return this._movies();
  }
}