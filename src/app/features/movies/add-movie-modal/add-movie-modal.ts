import { AfterViewInit, Component, DestroyRef, ElementRef, EventEmitter, Output, ViewChild, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MovieService } from '../movies.service';
import { Movie } from '../../../models/movies.model';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-movie-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-movie-modal.html',
  styleUrls: ['./add-movie-modal.scss']
})
export class AddMovieModalComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieService = inject(MovieService);
  private latestSearchId = 0;

  @ViewChild('searchInput')
  private searchInput?: ElementRef<HTMLInputElement>;

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

  constructor() {
    this.movieForm.controls.title.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        const title = value.trim();

        if (!title) {
          this.searchResults.set([]);
          this.searchMessage.set('');
          this.searchInFlight.set(false);
          return;
        }

        this.runSearch(title);
      });
  }

  ngAfterViewInit(): void {
    this.focusSearchInput();
  }

  onSearch(): void {
    const title = this.movieForm.controls.title.value.trim();

    if (!title) {
      this.searchMessage.set('Enter a title to search.');
      this.searchResults.set([]);
      this.focusSearchInput();
      return;
    }

    this.runSearch(title);
    this.focusSearchInput();
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

  private runSearch(title: string): void {
    const searchId = ++this.latestSearchId;

    this.searchInFlight.set(true);
    this.searchMessage.set('');

    this.movieService.searchOmdbApi(title)
      .pipe(finalize(() => this.searchInFlight.set(false)))
      .subscribe({
        next: (results) => {
          if (searchId !== this.latestSearchId) {
            return;
          }

          this.searchResults.set(results);
          this.searchMessage.set(results.length ? '' : 'No results found.');
        },
        error: (error: Error) => {
          if (searchId !== this.latestSearchId) {
            return;
          }

          this.searchResults.set([]);
          this.searchMessage.set(error.message);
        }
      });
  }

  private focusSearchInput(): void {
    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
      this.searchInput?.nativeElement.select();
    });
  }
}
