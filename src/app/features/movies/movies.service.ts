// movie.service.ts
// This service is responsible ONLY for talking to the backend API.
// It does not manage UI state or rendering.

import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Movie } from '../../models/movies.model';
import { catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root' // Makes this service available app-wide
})
export class MovieService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Movies`;

  // HttpClient is injected (provided in main.ts via provideHttpClient)
  constructor(private http: HttpClient) {}

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
    return this.http.get<Movie[]>(`${this.apiUrl}/search`, {
      params: { query }
    }).pipe(catchError((error: unknown) => this.mapApiError(error, 'OMDb search failed.')));
  }

  getOmdbMovieById(id: string): Observable<Movie> {
    return this.http
      .get<Movie>(`${this.apiUrl}/lookup/${encodeURIComponent(id)}`)
      .pipe(catchError((error: unknown) => this.mapApiError(error, 'OMDb lookup failed.')));
  }

  private mapApiError(error: unknown, fallbackMessage: string) {
    if (error instanceof HttpErrorResponse) {
      return throwError(() => new Error(error.error || fallbackMessage));
    }

    if (error instanceof Error) {
      return throwError(() => error);
    }

    return throwError(() => new Error(fallbackMessage));
  }
}
