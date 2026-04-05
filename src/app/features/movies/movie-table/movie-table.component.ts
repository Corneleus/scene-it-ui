import { Component, computed, effect, input, output, signal } from '@angular/core';
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
  private static readonly pageSize = 15;

  movies = input<Movie[]>([]);
  deleting = input(false);
  sortColumn = signal<SortColumn>('title');
  sortDirection = signal<SortDirection>('asc');
  currentPage = signal(0);
  softDeleteRequested = output<number[]>();
  hardDeleteRequested = output<number[]>();
  detailsRequested = output<Movie>();

  // ✅ Multi-select state (track selected movie IDs)
  selectedMovieIds = signal<Set<number>>(new Set());

  constructor() {
    effect(() => {
      const movieIds = new Set(this.movies().map((movie) => movie.movieId));
      const selectedIds = this.selectedMovieIds();
      const nextSelectedIds = new Set([...selectedIds].filter((id) => movieIds.has(id)));

      if (nextSelectedIds.size !== selectedIds.size) {
        this.selectedMovieIds.set(nextSelectedIds);
      }
    });

    effect(() => {
      const lastPage = Math.max(0, Math.ceil(this.movies().length / MovieTableComponent.pageSize) - 1);
      const currentPage = this.currentPage();

      if (currentPage > lastPage) {
        this.currentPage.set(lastPage);
      }
    });
  }

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

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedMovies().length / MovieTableComponent.pageSize))
  );

  pagedMovies = computed(() => {
    const start = this.currentPage() * MovieTableComponent.pageSize;
    return this.sortedMovies().slice(start, start + MovieTableComponent.pageSize);
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

  goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(0, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages() - 1, page + 1));
  }

  private getSortableValue(movie: Movie, column: SortColumn): string {
    return (movie[column] ?? '').toString().toLocaleLowerCase();
  }
}
