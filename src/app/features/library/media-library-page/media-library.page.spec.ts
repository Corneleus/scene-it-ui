import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MediaItem } from '../../../models/media-item.model';
import { MediaLibraryService } from '../media-library.service';
import { MediaLibraryPageComponent } from './media-library.page';

class MediaLibraryServiceStub {
  readonly listItems = vi.fn((kind?: string) => {
    const itemsByKind: Record<string, MediaItem[]> = {
      movie: [{ mediaItemId: 1, title: 'Arrival', imdbId: 'tt2543164' }],
      series: [{ mediaItemId: 2, title: 'Band of Brothers', imdbId: 'tt0185906' }],
      videoGame: [{ mediaItemId: 3, title: 'The Last of Us', imdbId: 'tt2140553' }],
    };

    return of(itemsByKind[kind ?? 'movie'] ?? []);
  });

  readonly softDeleteItem = vi.fn(() => of(void 0));
  readonly hardDeleteItem = vi.fn(() => of(void 0));
}

describe('MediaLibraryPageComponent', () => {
  let fixture: ComponentFixture<MediaLibraryPageComponent>;
  let service: MediaLibraryServiceStub;

  beforeEach(async () => {
    service = new MediaLibraryServiceStub();

    await TestBed.configureTestingModule({
      imports: [MediaLibraryPageComponent],
      providers: [{ provide: MediaLibraryService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaLibraryPageComponent);
    fixture.componentRef.setInput('kind', 'movie');
    fixture.componentRef.setInput('heroTitle', 'Movie Library');
    fixture.componentRef.setInput('heroCopy', 'Browse your media library.');
    fixture.componentRef.setInput('panelTitle', 'All Movies');
    fixture.componentRef.setInput('triggerLabel', 'Add Movie');
    fixture.componentRef.setInput('itemLabel', 'movie');
    fixture.componentRef.setInput('itemLabelPlural', 'movies');
    fixture.componentRef.setInput('deleteItemLabel', 'movie');
    fixture.componentRef.setInput('deleteItemLabelPlural', 'movies');
    fixture.componentRef.setInput('detailTitle', 'Movie Details');
    fixture.componentRef.setInput('searchLabel', 'Search movies');
    fixture.componentRef.setInput('selectedLabel', 'Selected Movies');
    fixture.componentRef.setInput('loadErrorMessage', 'Unable to load movies.');
    fixture.componentRef.setInput('selectionStatusMessage', 'Updating movie selection...');
    fixture.componentRef.setInput('softDeleteErrorMessage', 'Unable to soft delete selected movies.');
    fixture.componentRef.setInput('hardDeleteErrorMessage', 'Unable to hard delete selected movies.');
  });

  it('loads items for the initial kind', () => {
    fixture.detectChanges();

    expect(service.listItems).toHaveBeenCalledWith('movie');
    expect(fixture.componentInstance.items().map((item) => item.title)).toEqual(['Arrival']);
  });

  it('reloads items when the kind input changes on the same component instance', () => {
    fixture.detectChanges();

    fixture.componentRef.setInput('kind', 'series');
    fixture.detectChanges();

    expect(service.listItems).toHaveBeenNthCalledWith(2, 'series');
    expect(fixture.componentInstance.items().map((item) => item.title)).toEqual(['Band of Brothers']);
  });
});
