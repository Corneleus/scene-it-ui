// movie.service.ts
// This service is responsible ONLY for talking to the backend API.
// It does not manage UI state or rendering.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../../models/movies.model';

@Injectable({
  providedIn: 'root' // Makes this service available app-wide
})
export class MovieService {

  // URL of the ASP.NET Core MoviesController
  private apiUrl = 'https://localhost:44383/api/Movies';

  // HttpClient is injected (provided in main.ts via provideHttpClient)
  constructor(private http: HttpClient) {}

  /**
   * Fetch all movies from the backend database
   * GET https://localhost:44383/api/Movies
   */
  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.apiUrl);
  }
}
