import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ImportsService } from './imports.service';
import { ImportQueueItem, ImportRunResult, QueueImportItem } from '../../models/imports.model';
import { Movie } from '../../models/movies.model';
import { MovieService } from '../movies/movies.service';

@Component({
  selector: 'app-imports-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './imports.page.html',
  styleUrl: './imports.page.scss',
})
export class ImportsPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly importsService = inject(ImportsService);

  readonly queueItems = signal<ImportQueueItem[]>([]);
  readonly importRuns = signal<ImportRunResult[]>([]);
  readonly queueLoading = signal(true);
  readonly runsLoading = signal(true);
  readonly queueSubmitting = signal(false);
  readonly runSubmitting = signal(false);
  readonly feedbackMessage = signal('');
  readonly feedbackTone = signal<'success' | 'error'>('success');

  readonly rowSearchResults = signal<Record<number, Movie[]>>({});
  readonly rowSearchLoading = signal<Record<number, boolean>>({});

  readonly queueForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createQueueItemGroup()]),
  });

  readonly runForm = this.formBuilder.group({
    maxCount: this.formBuilder.control(25, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(500)],
    }),
  });

  readonly pendingCount = computed(
    () => this.queueItems().filter((item) => item.status.toLowerCase() === 'pending').length,
  );

  readonly failedCount = computed(
    () => this.queueItems().filter((item) => item.status.toLowerCase() === 'failed').length,
  );

  private readonly movieService = inject(MovieService);

  constructor() {
    this.refreshQueue();
    this.refreshRuns();
  }

  get itemsFormArray(): FormArray {
    return this.queueForm.controls.items;
  }

  addQueueRow(): void {
    this.itemsFormArray.push(this.createQueueItemGroup());
    this.rowSearchResults.update((state) => ({ ...state, [this.itemsFormArray.length - 1]: [] }));
  }


  removeQueueRow(index: number): void {
    if (this.itemsFormArray.length === 1) {
      this.itemsFormArray.at(0).reset({ imdbId: '', title: '' });
      return;
    }

    this.itemsFormArray.removeAt(index);
  }

  searchRow(index: number): void {
    const group = this.itemsFormArray.at(index) as FormGroup;
    const query = group.controls.searchQuery.value.trim();

    if (!query) {
      return;
    }

    this.rowSearchLoading.update((state) => ({ ...state, [index]: true }));

    this.movieService
      .searchOmdbApi(query)
      .pipe(finalize(() => this.rowSearchLoading.update((state) => ({ ...state, [index]: false }))))
      .subscribe({
        next: (results) => {
          this.rowSearchResults.update((state) => ({ ...state, [index]: results }));
        },
        error: (error: Error) => this.setFeedback(error.message, 'error'),
      });
  }

  selectSearchResult(index: number, movie: Movie): void {
    this.itemsFormArray.at(index).patchValue({
      imdbId: movie.imdbId,
      title: movie.title,
      searchQuery: movie.title,
    });
    this.rowSearchResults.update((state) => ({ ...state, [index]: [] }));
  }

  queueImports(): void {
    if (this.queueForm.invalid || this.queueSubmitting()) {
      this.queueForm.markAllAsTouched();
      return;
    }

    const items = this.itemsFormArray.controls
      .map((control) => {
        const imdbId = (control.value.imdbId ?? '').trim();
        const title = (control.value.title ?? '').trim();

        return {
          imdbId,
          title: title || null,
        } satisfies QueueImportItem;
      })
      .filter((item) => item.imdbId);

    if (items.length === 0) {
      this.setFeedback('Add at least one IMDb ID to queue.', 'error');
      return;
    }

    this.queueSubmitting.set(true);
    this.feedbackMessage.set('');

    this.importsService
      .queueItems(items)
      .pipe(finalize(() => this.queueSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          const skippedText =
            result.skippedCount > 0 ? ` ${result.skippedCount} duplicate item(s) were skipped.` : '';

          this.setFeedback(`Queued ${result.queuedCount} import item(s).${skippedText}`, 'success');
          this.queueForm.setControl('items', this.formBuilder.array([this.createQueueItemGroup()]));
          this.refreshQueue();
        },
        error: (error: Error) => this.setFeedback(error.message, 'error'),
      });
  }

  runImports(): void {
    if (this.runForm.invalid || this.runSubmitting()) {
      this.runForm.markAllAsTouched();
      return;
    }

    const maxCount = this.runForm.controls.maxCount.getRawValue();
    this.runSubmitting.set(true);
    this.feedbackMessage.set('');

    this.importsService
      .runImport(maxCount)
      .pipe(finalize(() => this.runSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          this.setFeedback(
            `Import run completed. Imported ${result.importedCount}, duplicates ${result.duplicateCount}, failed ${result.failedCount}.`,
            'success',
          );
          this.refreshQueue();
          this.refreshRuns();
        },
        error: (error: Error) => this.setFeedback(error.message, 'error'),
      });
  }

  refreshQueue(): void {
    this.queueLoading.set(true);

    this.importsService
      .getQueue()
      .pipe(finalize(() => this.queueLoading.set(false)))
      .subscribe({
        next: (items) => this.queueItems.set(items),
        error: (error: Error) => this.setFeedback(error.message, 'error'),
      });
  }

  refreshRuns(): void {
    this.runsLoading.set(true);

    this.importsService
      .getRuns()
      .pipe(finalize(() => this.runsLoading.set(false)))
      .subscribe({
        next: (runs) => this.importRuns.set(runs),
        error: (error: Error) => this.setFeedback(error.message, 'error'),
      });
  }

  trackByQueueIndex(index: number): number {
    return index;
  }

  trackByQueueItem(_: number, item: ImportQueueItem): number {
    return item.importQueueId;
  }

  trackByRun(_: number, run: ImportRunResult): number {
    return run.importRunId;
  }

  trackByMovie(_: number, movie: Movie): string {
    return movie.imdbId;
  }

  private createQueueItemGroup() {
    return this.formBuilder.group({
      searchQuery: this.formBuilder.control('', { nonNullable: true }),
      imdbId: this.formBuilder.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      title: this.formBuilder.control('', { nonNullable: true }),
    });
  }

  private setFeedback(message: string, tone: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackTone.set(tone);
  }
}
