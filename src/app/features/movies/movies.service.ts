// movie.service.ts
// This service is responsible ONLY for talking to the backend API.
// It does not manage UI state or rendering.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../../models/movies.model';
import { HttpParams } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

 interface OmdbSearchResponse{
  Search?: any[];
 }

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

  addMovie(movie:Movie): Observable<string>{
    return this.http.post<string>(this.apiUrl + '/add', movie);
  }

  searchOmdbApi(query: string): Observable<Movie[]> {
    return this.http.get<OmdbSearchResponse>('https://www.omdbapi.com/', {
      params: new HttpParams().set('apikey', this.apiKey).set('s', query)
    }).pipe(
      map(res => res.Search?.map(o => this.convertJsonToMovie(o)) ?? []),
      catchError(() => of([]))
    );
  }

  getOmdbMovieById(id: string): Observable<Movie> {
    return this.http.get<string>(`https://www.omdbapi.com/?apiKey=${this.apiKey}&i=${id}`).
      pipe(map(obj => this.convertJsonToMovie(obj)));
  }

  private convertJsonToMovie(o: any): Movie {
    return {
      movieId: 0,
      title: o?.Title,
      year: o?.Year,
      rated: o?.Rated,
      released: o?.Released !== 'N/A' ? o?.Released : null,
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
      imdbId: o?.imdbId,
      type: o?.Type,
      dvd: o?.DVD,
      boxOffice: o?.BoxOffice,
      production: o?.Production
    };
  }
  



}
 