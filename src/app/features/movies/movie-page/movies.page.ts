// src/app/features/movies/movies.page.ts
// Standalone component to display the Movies page and fetch data from backend API
// Simplified version: no error handling, only loading and movies display

import { Component, signal, effect, computed, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Movie } from '../../../models/movies.model';
import { MovieTableComponent } from '../movie-table/movie-table.component';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, single } from 'rxjs/operators';
import { AddMovie } from "../add-movie/add-movie";

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [
    CommonModule,
    MovieTableComponent,
    RouterModule,
    AddMovie
],
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss']
})
export class MoviesPage {

  /** Signal for the dynamic page title */
  title = signal('Welcome to SceneIt');

  /** Signal for movies array */
  movies = signal<Movie[]>([]);

  /** Signal for loading state */
  loading = signal(true);

  constructor(private http: HttpClient, private router: Router) {
    this.fetchMovies();

    // Update title when route changes
    effect(() => {
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(event => {
          this.title.set(event.urlAfterRedirects.startsWith('/movies')
            ? 'SceneIt Movies'
            : 'Welcome to SceneIt');
        });
    });
  }

  /** Fetch movies from backend API */
  fetchMovies(): void {
    this.loading.set(true);  // Start loading
    this.http.get<Movie[]>('https://localhost:44383/api/Movies')
      .subscribe(data => {
        this.movies.set(data);  // Set movies
        this.loading.set(false); // Stop loading
      });
  }
}
