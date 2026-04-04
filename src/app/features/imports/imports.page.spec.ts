import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ImportsPage } from './imports.page';
import { ImportsService } from './imports.service';
import { MovieService } from '../movies/movies.service';
import { ImportQueueItem, ImportRunResult, QueueImportResult } from '../../models/imports.model';
import { Movie } from '../../models/movies.model';

class ImportsServiceStub {
  getQueue = vi.fn(() => of([] as ImportQueueItem[]));
  getRuns = vi.fn(() => of([] as ImportRunResult[]));
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

class MovieServiceStub {
  searchOmdbApi = vi.fn(() => of([] as Movie[]));
  getOmdbMovieById = vi.fn((imdbId: string) =>
    of({
      movieId: 1,
      title: 'Batman Begins',
      imdbId,
    } satisfies Movie),
  );
}

describe('ImportsPage', () => {
  let importsService: ImportsServiceStub;
  let movieService: MovieServiceStub;

  beforeEach(async () => {
    importsService = new ImportsServiceStub();
    movieService = new MovieServiceStub();

    await TestBed.configureTestingModule({
      imports: [ImportsPage],
      providers: [
        { provide: ImportsService, useValue: importsService },
        { provide: MovieService, useValue: movieService },
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

  it('looks up an IMDb id and patches the queue row values', () => {
    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const row = component.itemsFormArray.at(0);
    row.patchValue({ imdbLookup: 'tt0372784' });

    component.lookupImdb(0);

    expect(movieService.getOmdbMovieById).toHaveBeenCalledWith('tt0372784');
    expect(row.get('imdbId')?.value).toBe('tt0372784');
    expect(row.get('title')?.value).toBe('Batman Begins');
    expect(row.get('searchQuery')?.value).toBe('Batman Begins');
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

    expect(movieService.searchOmdbApi).toHaveBeenCalledWith('Heat');
  });

  it('reindexes row search state when removing a row', () => {
    const fixture = TestBed.createComponent(ImportsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.addQueueRow();

    const firstResult: Movie = { movieId: 1, title: 'Arrival', imdbId: 'tt2543164' };
    const secondResult: Movie = { movieId: 2, title: 'Heat', imdbId: 'tt0113277' };

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
});
