import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MediaLibraryService } from '../../library/media-library.service';
import { MediaItem, MediaKind } from '../../../models/media-item.model';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-media-item-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-media-item-modal.html',
  styleUrls: ['./add-media-item-modal.scss']
})
export class AddMediaItemModalComponent implements AfterViewInit {
  private static readonly minSearchLength = 2;
  private readonly destroyRef = inject(DestroyRef);
  private readonly mediaLibraryService = inject(MediaLibraryService);
  private latestSearchId = 0;
  kind: MediaKind | null = null;
  itemLabel = 'media item';

  @ViewChild('searchInput')
  private searchInput?: ElementRef<HTMLInputElement>;

  mediaItemForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    year: new FormControl(''),
  });

  searchResults = signal<MediaItem[]>([]);
  searchInFlight = signal(false);
  addInFlightId = signal<string | null>(null);
  searchMessage = signal('');

  @Output() close = new EventEmitter<void>();
  @Output() mediaItemAdded = new EventEmitter<string>();

  constructor() {
    this.mediaItemForm.controls.title.valueChanges
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

        if (title.length < AddMediaItemModalComponent.minSearchLength) {
          this.searchResults.set([]);
          this.searchMessage.set(`Enter at least ${AddMediaItemModalComponent.minSearchLength} characters to search.`);
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
    const title = this.mediaItemForm.controls.title.value.trim();

    if (!title) {
      this.searchMessage.set('Enter a title to search.');
      this.searchResults.set([]);
      this.focusSearchInput();
      return;
    }

    if (title.length < AddMediaItemModalComponent.minSearchLength) {
      this.searchMessage.set(`Enter at least ${AddMediaItemModalComponent.minSearchLength} characters to search.`);
      this.searchResults.set([]);
      this.focusSearchInput();
      return;
    }

    this.runSearch(title);
    this.focusSearchInput();
  }

  addMediaItemFromResult(result: MediaItem): void {
    if (!result.imdbId) {
      this.searchMessage.set('That result cannot be added because it is missing an IMDb ID.');
      return;
    }

    this.addInFlightId.set(result.imdbId);
    this.searchMessage.set('');

    this.mediaLibraryService.lookupByImdbId(result.imdbId)
      .pipe(
        switchMap((mediaItem) => this.mediaLibraryService.addItem(mediaItem)),
        finalize(() => this.addInFlightId.set(null))
      )
      .subscribe({
        next: (mediaItem) => {
          this.mediaItemAdded.emit(mediaItem.title);
          this.onClose();
        },
        error: (error: unknown) => {
          this.searchMessage.set(this.getAddErrorMessage(error, result.title));
        }
      });
  }

  onClose() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }

  private runSearch(title: string): void {
    const searchId = ++this.latestSearchId;

    this.searchInFlight.set(true);
    this.searchMessage.set('');

    this.mediaLibraryService.searchCatalog(title, this.kind ?? undefined)
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

  private getAddErrorMessage(error: unknown, fallbackTitle: string): string {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return `${fallbackTitle} is already in your library.`;
    }

    return 'Add failed. Try again.';
  }
}
