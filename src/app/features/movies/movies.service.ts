import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie } from '../../models/movies.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);

  private apiKey = '988bc720';
  private apiBase = '/api/movies';

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.apiBase);
  }

  searchOmdbApi(query: string): Observable<Movie[]> {
    return this.http
      .get(`http://www.omdbapi.com/?apikey=${this.apiKey}&s=${query}`)
      .pipe(
        map((res: any) => {
          if (!res?.Search) return [];
          return res.Search.map((obj: any) =>
            this.convertJsonToMovie(obj)
          );
        })
      );
  }

  getOmdbMovieById(id: string): Observable<Movie> {
    return this.http
      .get(`http://www.omdbapi.com/?apikey=${this.apiKey}&i=${id}`)
      .pipe(map((res: any) => this.convertJsonToMovie(res)));
  }

  // ✅ THIS GOES HERE
  private convertJsonToMovie(obj: any): Movie {
    return {
      movieId: 0,
      title: obj['Title'],
      year: obj['Year'],
      rated: obj['Rated'],
      released: obj['Released'] ? new Date(obj['Released']) : undefined,
      runtime: obj['Runtime'],
      genre: obj['Genre'],
      director: obj['Director'],
      writer: obj['Writer'],
      actors: obj['Actors'],
      plot: obj['Plot'],
      language: obj['Language'],
      country: obj['Country'],
      awards: obj['Awards'],
      poster: obj['Poster'],
      metascore: obj['Metascore'],
      imdbRating: obj['imdbRating'],
      imdbVotes: obj['imdbVotes'],
      imdbId: obj['imdbID'],
      type: obj['Type'],
      dvd: obj['DVD'],
      boxOffice: obj['BoxOffice'],
      production: obj['Production']
    };
  }
}
