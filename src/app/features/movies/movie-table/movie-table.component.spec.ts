import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieTableComponent } from './movie-table.component';
import { Movie } from '../../../models/movies.model';

describe('MovieTableComponent', () => {
  let fixture: ComponentFixture<MovieTableComponent>;
  let component: MovieTableComponent;

  const movies: Movie[] = Array.from({ length: 20 }, (_, index) => ({
    movieId: index + 1,
    title: `Movie ${String(index + 1).padStart(2, '0')}`,
    imdbId: `tt${String(index + 1).padStart(7, '0')}`
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movies', movies);
    fixture.detectChanges();
  });

  it('tracks multi-select state for clicked movies', () => {
    component.selectMovie(movies[0]);
    component.selectMovie(movies[1]);

    expect(component.selectedMovies().map((movie) => movie.movieId)).toEqual([1, 2]);
    expect(component.isSelected(movies[0])).toBe(true);
    expect(component.isSelected(movies[1])).toBe(true);
  });

  it('emits selected ids for soft delete', () => {
    const emittedIds: number[][] = [];
    component.softDeleteRequested.subscribe((ids) => emittedIds.push(ids));

    component.selectMovie(movies[0]);
    component.selectMovie(movies[1]);
    component.requestSoftDelete();

    expect(emittedIds).toEqual([[1, 2]]);
  });

  it('does not emit delete requests while deleting is in progress', () => {
    const emittedIds: number[][] = [];
    component.hardDeleteRequested.subscribe((ids) => emittedIds.push(ids));
    fixture.componentRef.setInput('deleting', true);
    fixture.detectChanges();

    component.selectMovie(movies[0]);
    component.requestHardDelete();

    expect(emittedIds).toEqual([]);
  });

  it('emits the requested movie for details', () => {
    const emittedMovies: Movie[] = [];
    component.detailsRequested.subscribe((movie) => emittedMovies.push(movie));

    component.openDetails(movies[1]);

    expect(emittedMovies).toEqual([movies[1]]);
  });

  it('prunes selected ids when the movie input changes', () => {
    component.selectMovie(movies[0]);
    component.selectMovie(movies[1]);

    fixture.componentRef.setInput('movies', [movies[0]]);
    fixture.detectChanges();

    expect(component.selectedMovies().map((movie) => movie.movieId)).toEqual([1]);
  });

  it('paginates the movie list', () => {
    expect(component.totalPages()).toBe(2);
    expect(component.pagedMovies().map((movie) => movie.movieId)).toEqual(
      movies.slice(0, 15).map((movie) => movie.movieId)
    );

    component.goToNextPage();

    expect(component.currentPage()).toBe(1);
    expect(component.pagedMovies().map((movie) => movie.movieId)).toEqual(
      movies.slice(15).map((movie) => movie.movieId)
    );
  });

  it('clamps the current page when the movie list shrinks', () => {
    component.goToNextPage();
    fixture.detectChanges();

    fixture.componentRef.setInput('movies', movies.slice(0, 5));
    fixture.detectChanges();

    expect(component.currentPage()).toBe(0);
    expect(component.totalPages()).toBe(1);
  });
});
