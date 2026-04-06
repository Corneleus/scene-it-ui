import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SeriesPage } from './series.page';
import { MediaLibraryService } from '../library/media-library.service';
import { MediaItem } from '../../models/media-item.model';

class MediaLibraryServiceStub {
  items: MediaItem[] = [{ mediaItemId: 2, movieId: 2, title: 'Band of Brothers', imdbId: 'tt0185906' }];
  listItems = vi.fn(() => of(this.items));
  softDeleteItem = vi.fn(() => of(void 0));
  hardDeleteItem = vi.fn(() => of(void 0));
}

describe('SeriesPage', () => {
  it('loads series on init using the series kind filter', async () => {
    const service = new MediaLibraryServiceStub();

    await TestBed.configureTestingModule({
      imports: [SeriesPage],
      providers: [{ provide: MediaLibraryService, useValue: service }],
    }).compileComponents();

    const fixture = TestBed.createComponent(SeriesPage);
    fixture.detectChanges();

    expect(service.listItems).toHaveBeenCalledWith('series');
    expect(fixture.nativeElement.textContent).toContain('Series Library');
    expect(fixture.nativeElement.textContent).toContain('All Series');
  });
});
