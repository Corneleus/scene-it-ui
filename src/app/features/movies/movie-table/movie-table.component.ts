import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../models/movies.model';

type SortColumn = 'title' | 'genre' | 'year' | 'rated';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-movie-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-table.component.html',
  styleUrls: ['./movie-table.component.scss']
})
export class MovieTableComponent {
  movies = input<Movie[]>([]);
  deleting = input(false);
  sortColumn = signal<SortColumn>('title');
  sortDirection = signal<SortDirection>('asc');
  softDeleteRequested = output<number[]>();
  hardDeleteRequested = output<number[]>();
  detailsRequested = output<Movie>();

  // ✅ Multi-select state (track selected movie IDs)
  selectedMovieIds = signal<Set<number>>(new Set());

  // ✅ Computed derived state for template
  sortedMovies = computed(() => {
    const column = this.sortColumn();
    const direction = this.sortDirection();
    const directionMultiplier = direction === 'asc' ? 1 : -1;

    return [...this.movies()].sort((left, right) => {
      const leftValue = this.getSortableValue(left, column);
      const rightValue = this.getSortableValue(right, column);

      if (leftValue < rightValue) {
        return -1 * directionMultiplier;
      }

      if (leftValue > rightValue) {
        return 1 * directionMultiplier;
      }

      return 0;
    });
  });

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

  requestSoftDelete(): void {
    const selectedIds = Array.from(this.selectedMovieIds());
    if (selectedIds.length === 0 || this.deleting()) {
      return;
    }

    this.softDeleteRequested.emit(selectedIds);
  }

  requestHardDelete(): void {
    const selectedIds = Array.from(this.selectedMovieIds());
    if (selectedIds.length === 0 || this.deleting()) {
      return;
    }

    this.hardDeleteRequested.emit(selectedIds);
  }

  openDetails(movie: Movie): void {
    this.detailsRequested.emit(movie);
  }

  setSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((direction) => direction === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortColumn.set(column);
    this.sortDirection.set('asc');
  }

  getSortIndicator(column: SortColumn): string {
    if (this.sortColumn() !== column) {
      return '';
    }

    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  private getSortableValue(movie: Movie, column: SortColumn): string {
    return (movie[column] ?? '').toString().toLocaleLowerCase();
  }
}
