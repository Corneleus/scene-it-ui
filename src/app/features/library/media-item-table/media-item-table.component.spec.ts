import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaItemTableComponent } from './media-item-table.component';
import { MediaItem } from '../../../models/media-item.model';

describe('MediaItemTableComponent', () => {
  let fixture: ComponentFixture<MediaItemTableComponent>;
  let component: MediaItemTableComponent;

  const movies: MediaItem[] = Array.from({ length: 20 }, (_, index) => ({
    mediaItemId: index + 1,
    title: `Movie ${String(index + 1).padStart(2, '0')}`,
    imdbId: `tt${String(index + 1).padStart(7, '0')}`
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaItemTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaItemTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', movies);
    fixture.detectChanges();
  });

  it('tracks multi-select state for clicked movies', () => {
    component.toggleSelection(movies[0]);
    component.toggleSelection(movies[1]);

    expect(component.selectedItems().map((movie) => movie.mediaItemId)).toEqual([1, 2]);
    expect(component.isSelected(movies[0])).toBe(true);
    expect(component.isSelected(movies[1])).toBe(true);
  });

  it('emits selected ids for soft delete', () => {
    const emittedIds: number[][] = [];
    component.softDeleteRequested.subscribe((ids) => emittedIds.push(ids));

    component.toggleSelection(movies[0]);
    component.toggleSelection(movies[1]);
    component.requestSoftDelete();

    expect(emittedIds).toEqual([[1, 2]]);
  });

  it('does not emit delete requests while deleting is in progress', () => {
    const emittedIds: number[][] = [];
    component.hardDeleteRequested.subscribe((ids) => emittedIds.push(ids));
    fixture.componentRef.setInput('deleting', true);
    fixture.detectChanges();

    component.toggleSelection(movies[0]);
    component.requestHardDelete();

    expect(emittedIds).toEqual([]);
  });

  it('emits the requested movie for details', () => {
    const emittedMovies: MediaItem[] = [];
    component.detailsRequested.subscribe((movie) => emittedMovies.push(movie));

    component.openDetails(movies[1]);

    expect(emittedMovies).toEqual([movies[1]]);
  });

  it('prunes selected ids when the movie input changes', () => {
    component.toggleSelection(movies[0]);
    component.toggleSelection(movies[1]);

    fixture.componentRef.setInput('items', [movies[0]]);
    fixture.detectChanges();

    expect(component.selectedItems().map((movie) => movie.mediaItemId)).toEqual([1]);
  });

  it('paginates the movie list', () => {
    expect(component.totalPages()).toBe(2);
    expect(component.pagedItems().map((movie) => movie.mediaItemId)).toEqual(
      movies.slice(0, 15).map((movie) => movie.mediaItemId)
    );

    component.goToNextPage();

    expect(component.currentPage()).toBe(1);
    expect(component.pagedItems().map((movie) => movie.mediaItemId)).toEqual(
      movies.slice(15).map((movie) => movie.mediaItemId)
    );
  });

  it('clamps the current page when the movie list shrinks', () => {
    component.goToNextPage();
    fixture.detectChanges();

    fixture.componentRef.setInput('items', movies.slice(0, 5));
    fixture.detectChanges();

    expect(component.currentPage()).toBe(0);
    expect(component.totalPages()).toBe(1);
  });

  it('filters the movie list reactively from the search query', () => {
    component.updateSearchQuery('movie 20');

    expect(component.sortedItems().map((movie) => movie.mediaItemId)).toEqual([20]);
    expect(component.totalPages()).toBe(1);
    expect(component.pagedItems().map((movie) => movie.mediaItemId)).toEqual([20]);
  });
});
