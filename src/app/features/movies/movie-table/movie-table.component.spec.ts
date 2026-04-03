import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieTableComponent } from './movie-table.component';
import { Movie } from '../../../models/movies.model';

describe('MovieTableComponent', () => {
  let fixture: ComponentFixture<MovieTableComponent>;
  let component: MovieTableComponent;

  const movies: Movie[] = [
    { movieId: 1, title: 'Arrival', imdbId: 'tt2543164' },
    { movieId: 2, title: 'Heat', imdbId: 'tt0113277' }
  ];

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
});
