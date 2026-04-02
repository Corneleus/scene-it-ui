import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MoviesPage } from './movies.page';
import { MovieService } from '../movies.service';
import { Movie } from '../../../models/movies.model';

class MovieServiceStub {
  movies: Movie[] = [{ movieId: 1, title: 'Arrival', imdbId: 'tt2543164' }];
  getAllMovies = vi.fn(() => of(this.movies));
  softDeleteMovie = vi.fn(() => of(void 0));
  hardDeleteMovie = vi.fn(() => of(void 0));
}

describe('MoviesPage', () => {
  let service: MovieServiceStub;

  beforeEach(async () => {
    service = new MovieServiceStub();

    await TestBed.configureTestingModule({
      imports: [MoviesPage],
      providers: [{ provide: MovieService, useValue: service }]
    }).compileComponents();
  });

  it('loads movies on init', () => {
    const fixture = TestBed.createComponent(MoviesPage);
    fixture.detectChanges();

    expect(service.getAllMovies).toHaveBeenCalled();
    expect(fixture.componentInstance.movies().length).toBe(1);
  });

  it('soft deletes selected ids, refreshes movies, and shows success feedback', () => {
    const fixture = TestBed.createComponent(MoviesPage);
    fixture.detectChanges();

    fixture.componentInstance.softDeleteMovies([1, 2]);

    expect(service.softDeleteMovie).toHaveBeenCalledTimes(2);
    expect(service.getAllMovies).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.feedbackMessage()).toBe('2 movies soft deleted.');
    expect(fixture.componentInstance.feedbackTone()).toBe('success');
  });

  it('shows an error message when soft delete fails', () => {
    service.softDeleteMovie = vi.fn(() => throwError(() => new Error('delete failed')));
    const fixture = TestBed.createComponent(MoviesPage);
    fixture.detectChanges();

    fixture.componentInstance.softDeleteMovies([1]);

    expect(fixture.componentInstance.feedbackMessage()).toBe('Unable to soft delete selected movies.');
    expect(fixture.componentInstance.feedbackTone()).toBe('error');
  });

  it('hard delete stops when confirmation is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(MoviesPage);
    fixture.detectChanges();

    fixture.componentInstance.hardDeleteMovies([1]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(service.hardDeleteMovie).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('hard delete proceeds after confirmation and refreshes movies', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(MoviesPage);
    fixture.detectChanges();

    fixture.componentInstance.hardDeleteMovies([1]);

    expect(service.hardDeleteMovie).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.feedbackMessage()).toBe('1 movie permanently deleted.');
    expect(fixture.componentInstance.feedbackTone()).toBe('success');
    confirmSpy.mockRestore();
  });

  it('shows add success feedback and refreshes movies', () => {
    const fixture = TestBed.createComponent(MoviesPage);
    fixture.detectChanges();

    fixture.componentInstance.handleMovieAdded('Arrival');

    expect(service.getAllMovies).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.feedbackMessage()).toBe('Arrival was added to your library.');
    expect(fixture.componentInstance.feedbackTone()).toBe('success');
  });
});
