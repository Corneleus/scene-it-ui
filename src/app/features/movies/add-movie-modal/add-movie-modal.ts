import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MovieService } from '../movies.service';
import { Movie } from '../../../models/movies.model';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-add-movie-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-movie-modal.html',
  styleUrls: ['./add-movie-modal.scss']
})
export class AddMovieModalComponent {
  private readonly movieService = inject(MovieService);

  movieForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    year: new FormControl(''),
  });

  searchResults = signal<Movie[]>([]);
  searchInFlight = signal(false);
  addInFlightId = signal<string | null>(null);
  searchMessage = signal('');

  @Output() close = new EventEmitter<void>();
  @Output() movieAdded = new EventEmitter<void>();

  onSearch(): void {
    const title = this.movieForm.controls.title.value.trim();

    if (!title) {
      this.searchMessage.set('Enter a title to search.');
      this.searchResults.set([]);
      return;
    }

    this.searchInFlight.set(true);
    this.searchMessage.set('');

    this.movieService.searchOmdbApi(title)
      .pipe(finalize(() => this.searchInFlight.set(false)))
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.searchMessage.set(results.length ? '' : 'No results found.');
        },
        error: (error: Error) => {
          this.searchResults.set([]);
          this.searchMessage.set(error.message);
        }
      });
  }

  addMovieFromResult(result: Movie): void {
    if (!result.imdbId) {
      this.searchMessage.set('That result cannot be added because it is missing an IMDb ID.');
      return;
    }

    this.addInFlightId.set(result.imdbId);
    this.searchMessage.set('');

    this.movieService.getOmdbMovieById(result.imdbId)
      .pipe(
        switchMap((movie) => this.movieService.addMovie(movie)),
        finalize(() => this.addInFlightId.set(null))
      )
      .subscribe({
        next: () => {
          this.movieAdded.emit();
          this.onClose();
        },
        error: () => {
          this.searchMessage.set('Add failed. Try again.');
        }
      });
  }

  onClose() {
    this.close.emit();
  }
}
