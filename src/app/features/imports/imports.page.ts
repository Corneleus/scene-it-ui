import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImportsService } from './imports.service';
import {
  DatasetImportPreviewResult,
  DatasetImportRequest,
  ImportQueueItem,
  ImportRunResult,
  QueueDatasetImportsRequest,
  QueueImportItem,
} from '../../models/imports.model';
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
  private static readonly defaultDatasetPath = 'C:\\Users\\Corne\\source\\repos\\IMDB DataSet\\title.basics.tsv.gz';
  private static readonly currentItemsPageSize = 12;
  private static readonly detailedQueuePageSize = 50;

  private readonly formBuilder = inject(FormBuilder);
  private readonly importsService = inject(ImportsService);
  private readonly destroyRef = inject(DestroyRef);

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
  readonly rowLookupResults = signal<Record<number, Movie | null>>({});
  readonly rowLookupMessages = signal<Record<number, string>>({});
  readonly datasetPreview = signal<DatasetImportPreviewResult | null>(null);
  readonly datasetQueueSummary = signal<string>('');
  readonly datasetPreviewLoading = signal(false);
  readonly datasetQueueSubmitting = signal(false);
  readonly currentItemsPage = signal(0);
  readonly detailedQueuePage = signal(0);

  readonly queueForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createQueueItemGroup()]),
  });

  readonly datasetTypeOptions = [
    { controlName: 'movies', label: 'Movies', value: 'movie' },
    { controlName: 'series', label: 'Series', value: 'tvSeries' },
    { controlName: 'miniSeries', label: 'Mini Series', value: 'tvMiniSeries' },
    { controlName: 'episodes', label: 'Episodes', value: 'tvEpisode' },
    { controlName: 'shorts', label: 'Shorts', value: 'short' },
    { controlName: 'videoGames', label: 'Video Games', value: 'videoGame' },
  ] as const;

  readonly datasetForm = this.formBuilder.group({
    datasetPath: this.formBuilder.control(ImportsPage.defaultDatasetPath, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    movies: this.formBuilder.control(true, { nonNullable: true }),
    series: this.formBuilder.control(false, { nonNullable: true }),
    miniSeries: this.formBuilder.control(false, { nonNullable: true }),
    episodes: this.formBuilder.control(false, { nonNullable: true }),
    shorts: this.formBuilder.control(false, { nonNullable: true }),
    videoGames: this.formBuilder.control(false, { nonNullable: true }),
    excludeAdult: this.formBuilder.control(true, { nonNullable: true }),
    startYear: this.formBuilder.control<number | null>(null),
    endYear: this.formBuilder.control<number | null>(null),
    skipAlreadyImported: this.formBuilder.control(true, { nonNullable: true }),
    skipAlreadyQueued: this.formBuilder.control(true, { nonNullable: true }),
    maxToQueue: this.formBuilder.control<number | null>(5000, {
      validators: [Validators.min(1)],
    }),
  });

  readonly runForm = this.formBuilder.group({
    maxCount: this.formBuilder.control(25, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(500)],
    }),
  });

  readonly automationOptions = signal({
    enabled: true,
    runOnStartup: true,
    intervalMinutes: 1440,
    maxImportsPerDay: 100,
    maxCountPerRun: 100,
  });

  readonly automationForm = this.formBuilder.group({
    enabled: this.formBuilder.control(this.automationOptions().enabled),
    runOnStartup: this.formBuilder.control(this.automationOptions().runOnStartup),
    intervalMinutes: this.formBuilder.control(this.automationOptions().intervalMinutes, {
      validators: [Validators.required, Validators.min(1)],
    }),
    maxImportsPerDay: this.formBuilder.control(this.automationOptions().maxImportsPerDay, {
      validators: [Validators.required, Validators.min(1)],
    }),
    maxCountPerRun: this.formBuilder.control(this.automationOptions().maxCountPerRun, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  readonly pendingCount = computed(
    () => this.queueItems().filter((item) => item.status.toLowerCase() === 'pending').length,
  );

  readonly failedCount = computed(
    () => this.queueItems().filter((item) => item.status.toLowerCase() === 'failed').length,
  );

  private readonly movieService = inject(MovieService);

  readonly queueRows = computed(() =>
    this.itemsFormArray.controls.map((control) => control as FormGroup),
  );
  readonly currentItemsTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.queueItems().length / ImportsPage.currentItemsPageSize)),
  );
  readonly currentItemsView = computed(() => {
    const start = this.currentItemsPage() * ImportsPage.currentItemsPageSize;
    return this.queueItems().slice(start, start + ImportsPage.currentItemsPageSize);
  });
  readonly detailedQueueTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.queueItems().length / ImportsPage.detailedQueuePageSize)),
  );
  readonly detailedQueueView = computed(() => {
    const start = this.detailedQueuePage() * ImportsPage.detailedQueuePageSize;
    return this.queueItems().slice(start, start + ImportsPage.detailedQueuePageSize);
  });

  constructor() {
    this.refreshQueue();
    this.refreshRuns();
    this.attachQueueSearchWatchers();
    this.initializeRowState();
  }

  get itemsFormArray(): FormArray {
    return this.queueForm.controls.items;
  }

  addQueueRow(): void {
    const group = this.createQueueItemGroup();
    this.itemsFormArray.push(group);
    this.watchQueueSearch(group);
    const nextIndex = this.itemsFormArray.length - 1;
    this.rowSearchResults.update((state) => ({ ...state, [nextIndex]: [] }));
    this.rowSearchLoading.update((state) => ({ ...state, [nextIndex]: false }));
    this.rowLookupResults.update((state) => ({ ...state, [nextIndex]: null }));
    this.rowLookupMessages.update((state) => ({ ...state, [nextIndex]: '' }));
  }

  removeQueueRow(index: number): void {
    if (this.itemsFormArray.length === 1) {
      this.itemsFormArray.at(0).reset({ searchQuery: '', imdbLookup: '', imdbId: '', title: '' });
      this.rowSearchResults.set({ 0: [] });
      this.rowSearchLoading.set({ 0: false });
      this.rowLookupResults.set({ 0: null });
      this.rowLookupMessages.set({ 0: '' });
      return;
    }

    this.itemsFormArray.removeAt(index);
    this.reindexRowStateAfterRemoval(index);
  }

  searchRow(index: number): void {
    const group = this.itemsFormArray.at(index) as FormGroup;
    const query = (group.controls.searchQuery.value ?? '').trim();

    if (!query) {
      return;
    }

    this.rowSearchLoading.update((state) => ({ ...state, [index]: true }));
    this.clearLookupState(index);

    this.movieService
      .searchOmdbApi(query)
      .pipe(finalize(() => this.rowSearchLoading.update((state) => ({ ...state, [index]: false }))))
      .subscribe({
        next: (results) => {
          this.rowSearchResults.update((state) => ({ ...state, [index]: results }));
        },
        error: (error: Error) => {
          this.rowSearchResults.update((state) => ({ ...state, [index]: [] }));
          this.setFeedback(error.message, 'error');
        },
      });
  }

  selectSearchResult(index: number, movie: Movie): void {
    this.itemsFormArray.at(index).patchValue({
      imdbLookup: movie.imdbId,
      imdbId: movie.imdbId,
      title: movie.title,
      searchQuery: movie.title,
    });
    this.rowSearchResults.update((state) => ({ ...state, [index]: [] }));
    this.clearLookupState(index);
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
          this.resetQueueForm();
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
    this.runImportBatch(maxCount);
  }

  runAutomationNow(): void {
    if (this.runSubmitting()) {
      return;
    }

    this.runImportBatch(this.automationOptions().maxCountPerRun);
  }

  previewDatasetImports(): void {
    if (this.datasetForm.invalid || this.datasetPreviewLoading()) {
      this.datasetForm.markAllAsTouched();
      return;
    }

    this.datasetPreviewLoading.set(true);
    this.datasetQueueSummary.set('');
    this.feedbackMessage.set('');

    this.importsService
      .previewDataset(this.buildDatasetRequest())
      .pipe(finalize(() => this.datasetPreviewLoading.set(false)))
      .subscribe({
        next: (result) => this.datasetPreview.set(result),
        error: (error: Error) => this.setFeedback(error.message, 'error'),
      });
  }

  queueDatasetImports(): void {
    if (this.datasetForm.invalid || this.datasetQueueSubmitting()) {
      this.datasetForm.markAllAsTouched();
      return;
    }

    this.datasetQueueSubmitting.set(true);
    this.feedbackMessage.set('');

    this.importsService
      .queueDataset(this.buildDatasetQueueRequest())
      .pipe(finalize(() => this.datasetQueueSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          this.datasetPreview.set(result);
          this.datasetQueueSummary.set(
            `Queued ${result.queuedCount} dataset item(s) from ${result.readyToQueueCount} ready match(es).`,
          );
          this.setFeedback(`Queued ${result.queuedCount} dataset import item(s).`, 'success');
          this.refreshQueue();
        },
        error: (error: Error) => this.setFeedback(error.message, 'error'),
      });
  }

  private runImportBatch(maxCount: number): void {
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
        next: (items) => {
          this.queueItems.set(items);
          this.clampQueuePages(items.length);
        },
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

  goToPreviousCurrentItemsPage(): void {
    this.currentItemsPage.update((page) => Math.max(0, page - 1));
  }

  goToNextCurrentItemsPage(): void {
    this.currentItemsPage.update((page) => Math.min(this.currentItemsTotalPages() - 1, page + 1));
  }

  goToPreviousDetailedQueuePage(): void {
    this.detailedQueuePage.update((page) => Math.max(0, page - 1));
  }

  goToNextDetailedQueuePage(): void {
    this.detailedQueuePage.update((page) => Math.min(this.detailedQueueTotalPages() - 1, page + 1));
  }

  private watchQueueSearch(group: FormGroup) {
    group.controls.searchQuery.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        const index = this.itemsFormArray.controls.indexOf(group);
        if (index === -1) {
          return;
        }

        const trimmed = (value ?? '').trim();
        if (!trimmed) {
          this.rowSearchResults.update((state) => ({ ...state, [index]: [] }));
          return;
        }

        this.searchRow(index);
      });
  }

  private createQueueItemGroup() {
    return this.formBuilder.group({
      searchQuery: this.formBuilder.control('', { nonNullable: true }),
      imdbLookup: this.formBuilder.control('', { nonNullable: true }),
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

  private buildDatasetRequest(): DatasetImportRequest {
    const formValue = this.datasetForm.getRawValue();

    return {
      datasetPath: formValue.datasetPath.trim(),
      titleTypes: this.getSelectedDatasetTitleTypes(),
      excludeAdult: formValue.excludeAdult ?? true,
      startYear: formValue.startYear ?? null,
      endYear: formValue.endYear ?? null,
      skipAlreadyImported: formValue.skipAlreadyImported ?? true,
      skipAlreadyQueued: formValue.skipAlreadyQueued ?? true,
    };
  }

  private buildDatasetQueueRequest(): QueueDatasetImportsRequest {
    return {
      ...this.buildDatasetRequest(),
      maxToQueue: this.datasetForm.controls.maxToQueue.getRawValue() ?? null,
    };
  }

  private getSelectedDatasetTitleTypes(): string[] {
    return this.datasetTypeOptions
      .filter((option) => this.datasetForm.controls[option.controlName].getRawValue())
      .map((option) => option.value);
  }

  updateAutomationSettings(): void {
    if (this.automationForm.invalid) {
      return;
    }

    this.automationOptions.set({
      enabled: this.automationForm.controls.enabled.getRawValue() ?? false,
      runOnStartup: this.automationForm.controls.runOnStartup.getRawValue() ?? false,
      intervalMinutes: this.automationForm.controls.intervalMinutes.getRawValue() ?? 1,
      maxImportsPerDay: this.automationForm.controls.maxImportsPerDay.getRawValue() ?? 1,
      maxCountPerRun: this.automationForm.controls.maxCountPerRun.getRawValue() ?? 1,
    });

    this.setFeedback('Automation settings updated for this session only.', 'success');
  }

  lookupImdb(index: number): void {
    const group = this.itemsFormArray.at(index) as FormGroup;
    const imdbId = (group.controls.imdbLookup.value ?? '').trim();

    if (!imdbId) {
      this.setLookupMessage(index, 'Enter an IMDb ID to look up.');
      return;
    }

    this.rowSearchLoading.update((state) => ({ ...state, [index]: true }));
    this.rowSearchResults.update((state) => ({ ...state, [index]: [] }));
    this.rowLookupMessages.update((state) => ({ ...state, [index]: '' }));

    this.movieService
      .getOmdbMovieById(imdbId)
      .pipe(finalize(() => this.rowSearchLoading.update((state) => ({ ...state, [index]: false }))))
      .subscribe({
        next: (movie) => {
          group.patchValue({
            imdbLookup: movie.imdbId,
            imdbId: movie.imdbId,
            title: movie.title,
          });
          this.rowLookupResults.update((state) => ({ ...state, [index]: movie }));
          this.rowLookupMessages.update((state) => ({ ...state, [index]: '' }));
        },
        error: (error: Error) => {
          group.patchValue({
            imdbId: '',
            title: '',
          });
          this.rowLookupResults.update((state) => ({ ...state, [index]: null }));
          this.setLookupMessage(index, this.getLookupErrorMessage(error));
        },
      });
  }

  private attachQueueSearchWatchers(): void {
    this.itemsFormArray.controls.forEach((control) => this.watchQueueSearch(control as FormGroup));
  }

  private initializeRowState(): void {
    const initialResults: Record<number, Movie[]> = {};
    const initialLoading: Record<number, boolean> = {};
    const initialLookupResults: Record<number, Movie | null> = {};
    const initialLookupMessages: Record<number, string> = {};

    this.itemsFormArray.controls.forEach((_, index) => {
      initialResults[index] = [];
      initialLoading[index] = false;
      initialLookupResults[index] = null;
      initialLookupMessages[index] = '';
    });

    this.rowSearchResults.set(initialResults);
    this.rowSearchLoading.set(initialLoading);
    this.rowLookupResults.set(initialLookupResults);
    this.rowLookupMessages.set(initialLookupMessages);
  }

  private reindexRowStateAfterRemoval(removedIndex: number): void {
    const currentResults = this.rowSearchResults();
    const currentLoading = this.rowSearchLoading();
    const currentLookupResults = this.rowLookupResults();
    const currentLookupMessages = this.rowLookupMessages();
    const nextResults: Record<number, Movie[]> = {};
    const nextLoading: Record<number, boolean> = {};
    const nextLookupResults: Record<number, Movie | null> = {};
    const nextLookupMessages: Record<number, string> = {};

    this.itemsFormArray.controls.forEach((_, nextIndex) => {
      const sourceIndex = nextIndex >= removedIndex ? nextIndex + 1 : nextIndex;
      nextResults[nextIndex] = currentResults[sourceIndex] ?? [];
      nextLoading[nextIndex] = currentLoading[sourceIndex] ?? false;
      nextLookupResults[nextIndex] = currentLookupResults[sourceIndex] ?? null;
      nextLookupMessages[nextIndex] = currentLookupMessages[sourceIndex] ?? '';
    });

    this.rowSearchResults.set(nextResults);
    this.rowSearchLoading.set(nextLoading);
    this.rowLookupResults.set(nextLookupResults);
    this.rowLookupMessages.set(nextLookupMessages);
  }

  private resetQueueForm(): void {
    this.queueForm.setControl('items', this.formBuilder.array([this.createQueueItemGroup()]));
    this.attachQueueSearchWatchers();
    this.initializeRowState();
  }

  private clearLookupState(index: number): void {
    this.rowLookupResults.update((state) => ({ ...state, [index]: null }));
    this.rowLookupMessages.update((state) => ({ ...state, [index]: '' }));
  }

  private setLookupMessage(index: number, message: string): void {
    this.rowLookupResults.update((state) => ({ ...state, [index]: null }));
    this.rowLookupMessages.update((state) => ({ ...state, [index]: message }));
  }

  private getLookupErrorMessage(error: Error): string {
    return error.message === 'OMDb lookup failed.' ? 'That is not a valid IMDb ID.' : error.message;
  }

  private clampQueuePages(totalItems: number): void {
    const currentItemsLastPage = Math.max(0, Math.ceil(totalItems / ImportsPage.currentItemsPageSize) - 1);
    const detailedQueueLastPage = Math.max(0, Math.ceil(totalItems / ImportsPage.detailedQueuePageSize) - 1);

    this.currentItemsPage.update((page) => Math.min(page, currentItemsLastPage));
    this.detailedQueuePage.update((page) => Math.min(page, detailedQueueLastPage));
  }
}
