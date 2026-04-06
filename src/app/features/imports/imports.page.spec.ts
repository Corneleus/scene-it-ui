import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ImportsPage } from './imports.page';
import { ImportsService } from './imports.service';
import { MediaLibraryService } from '../library/media-library.service';
import {
  DatasetImportPreviewResult,
  ImportQueueItem,
  ImportRunResult,
  QueueImportResult,
} from '../../models/imports.model';
import { MediaItem } from '../../models/media-item.model';

class ImportsServiceStub {
  getQueue = vi.fn(() => of([] as ImportQueueItem[]));
  getRuns = vi.fn(() => of([] as ImportRunResult[]));
  previewDataset = vi.fn(() =>
    of({
      totalRowsScanned: 10,
      matchedCount: 6,
      alreadyQueuedCount: 2,
      alreadyImportedCount: 1,
      readyToQueueCount: 3,
    } satisfies DatasetImportPreviewResult),
  );
  queueDataset = vi.fn(() =>
    of({
      totalRowsScanned: 10,
      matchedCount: 6,
      alreadyQueuedCount: 2,
      alreadyImportedCount: 1,
      readyToQueueCount: 3,
      queuedCount: 3,
    }),
  );
  queueItems = vi.fn(() =>
    of({
      queuedCount: 1,
      skippedCount: 0,
      queuedItems: [],
    } satisfies QueueImportResult),
  );
  runImport = vi.fn(() =>
    of({
      importRunId: 1,
      startedAtUtc: '2026-04-04T00:00:00Z',
      completedAtUtc: '2026-04-04T00:01:00Z',
      requestedLimit: 25,
      attemptedCount: 1,
      importedCount: 1,
      duplicateCount: 0,
      failedCount: 0,
      notes: null,
    } satisfies ImportRunResult),
  );
}

class MediaLibraryServiceStub {
  searchCatalog = vi.fn(() => of([] as MediaItem[]));
  lookupByImdbId = vi.fn((imdbId: string) =>
    of({
      mediaItemId: 1,
      movieId: 1,
      title: 'Batman Begins',
      imdbId,
    } satisfies MediaItem),
  );
}

function createQueueItem(importQueueId: number): ImportQueueItem {
  return {
    importQueueId,
    imdbId: `tt${String(importQueueId).padStart(7, '0')}`,
    title: `Movie ${importQueueId}`,
    year: '2000',
    rated: null,
    runtime: null,
    genre: null,
    director: null,
    writer: null,
    actors: null,
    plot: null,
    language: null,
    country: null,
    awards: null,
    poster: null,
    metascore: null,
    imdbRating: null,
    imdbVotes: null,
    type: 'movie',
    dvd: null,
    boxOffice: null,
    production: null,
    status: 'Pending',
    attemptCount: 0,
    lastAttemptedAtUtc: null,
    importedAtUtc: null,
    errorMessage: null,
  };
}

describe('ImportsPage', () => {
  let importsService: ImportsServiceStub;
  let mediaLibraryService: MediaLibraryServiceStub;

  beforeEach(async () => {
    importsService = new ImportsServiceStub();
    mediaLibraryService = new MediaLibraryServiceStub();

    await TestBed.configureTestingModule({
      imports: [ImportsPage],
      providers: [
        { provide: ImportsService, useValue: importsService },
        { provide: MediaLibraryService, useValue: mediaLibraryService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads queue and runs on init', () => {
    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    expect(importsService.getQueue).toHaveBeenCalled();
    expect(importsService.getRuns).toHaveBeenCalled();
  });

  it('previews dataset matches using the dataset form filters', () => {
    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.datasetForm.patchValue({
      datasetPath: 'C:\\datasets\\title.basics.tsv.gz',
      movies: true,
      series: true,
      startYear: 1990,
      endYear: 2020,
      maxToQueue: 2500,
    });

    component.previewDatasetImports();

    expect(importsService.previewDataset).toHaveBeenCalledWith({
      datasetPath: 'C:\\datasets\\title.basics.tsv.gz',
      titleTypes: ['movie', 'tvSeries'],
      excludeAdult: true,
      startYear: 1990,
      endYear: 2020,
      skipAlreadyImported: true,
      skipAlreadyQueued: true,
    });
    expect(component.datasetPreview()?.readyToQueueCount).toBe(3);
  });

  it('looks up an IMDb id, patches the queue row values, and keeps the title search untouched', () => {
    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const row = component.itemsFormArray.at(0);
    row.patchValue({ imdbLookup: 'tt0372784', searchQuery: 'Batman' });

    component.lookupImdb(0);

    expect(mediaLibraryService.lookupByImdbId).toHaveBeenCalledWith('tt0372784');
    expect(row.get('imdbId')?.value).toBe('tt0372784');
    expect(row.get('title')?.value).toBe('Batman Begins');
    expect(row.get('searchQuery')?.value).toBe('Batman');
    expect(component.rowLookupResults()[0]?.title).toBe('Batman Begins');
    expect(component.rowLookupMessages()[0]).toBe('');
  });

  it('shows an inline invalid-id message when IMDb lookup fails', () => {
    mediaLibraryService.lookupByImdbId = vi.fn(() =>
      throwError(() => new Error('OMDb lookup failed.')),
    );

    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const row = component.itemsFormArray.at(0);
    row.patchValue({
      imdbLookup: 'not-valid',
      imdbId: 'tt0372784',
      title: 'Batman Begins',
    });

    component.lookupImdb(0);

    expect(row.get('imdbId')?.value).toBe('');
    expect(row.get('title')?.value).toBe('');
    expect(component.rowLookupResults()[0]).toBeNull();
    expect(component.rowLookupMessages()[0]).toBe('That is not a valid IMDb ID.');
  });

  it('rewires debounced row search after a successful queue reset', () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.itemsFormArray.at(0).patchValue({
      imdbId: 'tt2543164',
      title: 'Arrival',
    });

    component.queueImports();

    const resetRow = component.itemsFormArray.at(0);
    resetRow.get('searchQuery')?.setValue('Heat');
    vi.advanceTimersByTime(300);

    expect(mediaLibraryService.searchCatalog).toHaveBeenCalledWith('Heat');
  });

  it('reindexes row search state when removing a row', () => {
    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.addQueueRow();

    const firstResult: MediaItem = { mediaItemId: 1, movieId: 1, title: 'Arrival', imdbId: 'tt2543164' };
    const secondResult: MediaItem = { mediaItemId: 2, movieId: 2, title: 'Heat', imdbId: 'tt0113277' };

    component.rowSearchResults.set({ 0: [firstResult], 1: [secondResult] });
    component.rowSearchLoading.set({ 0: false, 1: true });

    component.removeQueueRow(0);

    expect(component.rowSearchResults()).toEqual({ 0: [secondResult] });
    expect(component.rowSearchLoading()).toEqual({ 0: true });
  });

  it('labels automation updates as session-only', () => {
    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    fixture.componentInstance.updateAutomationSettings();

    expect(fixture.componentInstance.feedbackMessage()).toBe(
      'Automation settings updated for this session only.',
    );
    expect(fixture.componentInstance.feedbackTone()).toBe('success');
  });

  it('limits rendered queue slices and clamps queue pages after refresh', () => {
    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.queueItems.set(Array.from({ length: 75 }, (_, index) => createQueueItem(index + 1)));
    component.currentItemsPage.set(1);
    component.detailedQueuePage.set(1);

    expect(component.currentItemsView()).toHaveLength(12);
    expect(component.currentItemsView()[0].importQueueId).toBe(13);
    expect(component.detailedQueueView()).toHaveLength(25);
    expect(component.detailedQueueView()[0].importQueueId).toBe(51);

    importsService.getQueue = vi.fn(() => of(Array.from({ length: 5 }, (_, index) => createQueueItem(index + 1))));

    component.refreshQueue();

    expect(component.currentItemsPage()).toBe(0);
    expect(component.detailedQueuePage()).toBe(0);
    expect(component.currentItemsView()).toHaveLength(5);
    expect(component.detailedQueueView()).toHaveLength(5);
  });
});
