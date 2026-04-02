// movie.service.ts
// This service is responsible ONLY for talking to the backend API.
// It does not manage UI state or rendering.

import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Movie } from '../../models/movies.model';
import { OmdbSearchItem } from '../../models/omdb-search-item.model';
import { OmdbSearchResponse } from '../../models/omdb-search-response.model';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root' // Makes this service available app-wide
})
export class MovieService {

  // URL of the ASP.NET Core MoviesController
  private apiUrl = 'https://localhost:44383/api/Movies';

  // HttpClient is injected (provided in main.ts via provideHttpClient)
  constructor(private http: HttpClient) {}

  private readonly apiKey = '988bc720';

  /**
   * Fetch all movies from the backend database
   * GET https://localhost:44383/api/Movies
   */
  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.apiUrl);
  }

  addMovie(movie:Movie): Observable<Movie>{
    return this.http.post<Movie>(this.apiUrl + '/add', movie);
  }

  softDeleteMovie(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/soft-delete`, {});
  }

  hardDeleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchOmdbApi(query: string): Observable<Movie[]> {
    return this.http.get<OmdbSearchResponse>('https://www.omdbapi.com/', {
      params: new HttpParams().set('apikey', this.apiKey).set('s', query)
    }).pipe(
      map((res) => {
        if (res.Response === 'False') {
          throw new Error(res.Error ?? 'OMDb search failed.');
        }

        return res.Search?.map((o) => this.convertJsonToMovie(o)) ?? [];
      }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          return throwError(() => new Error(`OMDb request failed: ${error.message}`));
        }

        if (error instanceof Error) {
          return throwError(() => error);
        }

        return throwError(() => new Error('OMDb search failed.'));
      })
    );
  }

  getOmdbMovieById(id: string): Observable<Movie> {
    return this.http.get<OmdbSearchItem>(`https://www.omdbapi.com/?apiKey=${this.apiKey}&i=${id}`).
      pipe(map(obj => this.convertJsonToMovie(obj)));
  }

  private convertJsonToMovie(o: OmdbSearchItem): Movie {
    return {
      movieId: 0,
      title: o?.Title ?? '',
      year: o?.Year,
      rated: o?.Rated,
      released: this.parseReleasedDate(o?.Released),
      runtime: o?.Runtime,
      genre: o?.Genre,
      director: o?.Director,
      writer: o?.Writer,
      actors: o?.Actors,
      plot: o?.Plot,
      language: o?.Language,
      country: o?.Country,
      awards: o?.Awards,
      poster: o?.Poster,
      metascore: o?.Metascore,
      imdbRating: o?.imdbRating,
      imdbId: o?.imdbID ?? '',
      type: o?.Type,
      dvd: o?.DVD,
      boxOffice: o?.BoxOffice,
      production: o?.Production
    };
  }
  
  private parseReleasedDate(value?: string): string | null {
    if (!value || value === 'N/A') {
      return null;
    }
  
    const parsed = new Date(value);
  
    if (isNaN(parsed.getTime())) {
      return null;
    }
  
    return parsed.toISOString();
  }
  
}
  




 
