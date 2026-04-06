import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MoviesPage } from './movies.page';
import { MediaLibraryService } from '../../library/media-library.service';
import { MediaItem } from '../../../models/media-item.model';

class MediaLibraryServiceStub {
  items: MediaItem[] = [{ mediaItemId: 1, title: 'Arrival', imdbId: 'tt2543164' }];
  listItems = vi.fn(() => of(this.items));
  softDeleteItem = vi.fn(() => of(void 0));
  hardDeleteItem = vi.fn(() => of(void 0));
}

describe('MoviesPage', () => {
  let service: MediaLibraryServiceStub;

  beforeEach(async () => {
    service = new MediaLibraryServiceStub();

    await TestBed.configureTestingModule({
      imports: [MoviesPage],
      providers: [{ provide: MediaLibraryService, useValue: service }]
    }).compileComponents();
  });

  it('loads movies on init', () => {
    const fixture = TestBed.createComponent(MoviesPage);
    fixture.detectChanges();

    expect(service.listItems).toHaveBeenCalledWith('movie');
    expect(fixture.nativeElement.textContent).toContain('Movie Library');
    expect(fixture.nativeElement.textContent).toContain('All Movies');
  });
});
