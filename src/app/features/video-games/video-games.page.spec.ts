import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { VideoGamesPage } from './video-games.page';
import { MediaLibraryService } from '../library/media-library.service';
import { MediaItem } from '../../models/media-item.model';

class MediaLibraryServiceStub {
  items: MediaItem[] = [{ mediaItemId: 3, movieId: 3, title: 'The Last of Us', imdbId: 'tt2140553' }];
  listItems = vi.fn(() => of(this.items));
  softDeleteItem = vi.fn(() => of(void 0));
  hardDeleteItem = vi.fn(() => of(void 0));
}

describe('VideoGamesPage', () => {
  it('loads video games on init using the video game kind filter', async () => {
    const service = new MediaLibraryServiceStub();

    await TestBed.configureTestingModule({
      imports: [VideoGamesPage],
      providers: [{ provide: MediaLibraryService, useValue: service }],
    }).compileComponents();

    const fixture = TestBed.createComponent(VideoGamesPage);
    fixture.detectChanges();

    expect(service.listItems).toHaveBeenCalledWith('videoGame');
    expect(fixture.nativeElement.textContent).toContain('Video Games Library');
    expect(fixture.nativeElement.textContent).toContain('All Video Games');
  });
});
