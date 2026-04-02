import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../models/movies.model';
import { MovieTableComponent } from '../movie-table/movie-table.component';
import { AddMovie } from '../add-movie/add-movie';
import { MovieService } from '../movies.service';
import { forkJoin } from 'rxjs';

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
  deleteInProgress = signal(false);
  feedbackMessage = signal('');
  feedbackTone = signal<'success' | 'error'>('success');

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
        this.setFeedback('Unable to load movies.', 'error');
        this.loading.set(false);
      }
    });
  }

  handleMovieAdded(title: string): void {
    this.setFeedback(`${title} was added to your library.`, 'success');
    this.fetchMovies();
  }

  softDeleteMovies(ids: number[]): void {
    this.runDeleteRequest(
      ids,
      (id) => this.movieService.softDeleteMovie(id),
      'Unable to soft delete selected movies.',
      `${ids.length} movie${ids.length === 1 ? '' : 's'} soft deleted.`
    );
  }

  hardDeleteMovies(ids: number[]): void {
    const confirmed = window.confirm(
      `Permanently delete ${ids.length} selected movie${ids.length === 1 ? '' : 's'}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.runDeleteRequest(
      ids,
      (id) => this.movieService.hardDeleteMovie(id),
      'Unable to hard delete selected movies.',
      `${ids.length} movie${ids.length === 1 ? '' : 's'} permanently deleted.`
    );
  }

  private runDeleteRequest(
    ids: number[],
    deleteRequest: (id: number) => ReturnType<MovieService['softDeleteMovie']>,
    errorMessage: string,
    successMessage: string
  ): void {
    if (ids.length === 0 || this.deleteInProgress()) {
      return;
    }

    this.deleteInProgress.set(true);
    this.feedbackMessage.set('');

    forkJoin(ids.map((id) => deleteRequest(id))).subscribe({
      next: () => {
        this.deleteInProgress.set(false);
        this.setFeedback(successMessage, 'success');
        this.fetchMovies();
      },
      error: () => {
        this.setFeedback(errorMessage, 'error');
        this.deleteInProgress.set(false);
      }
    });
  }

  private setFeedback(message: string, tone: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackTone.set(tone);
  }
}
