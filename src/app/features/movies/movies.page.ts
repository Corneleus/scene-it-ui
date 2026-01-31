// src/app/features/movies/movies.page.ts
// Standalone component to display the Movies page and fetch data from backend API

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf and *ngFor
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Movie } from '../../models/movies.model';
import { MovieTableComponent } from './movie-table/movie-table.component';

@Component({
  selector: 'app-movies',
  standalone: true, // This component is standalone (Angular 21 style)
  imports: [CommonModule , MovieTableComponent], // Import CommonModule for structural directives
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss']
})
export class MoviesPage {
  movies: Movie[] = []; // Array to store movies from API
  loading = true;       // Loading state
  error = '';           // Error message

  // Inject HttpClient to make API calls
  constructor(private http: HttpClient) {
    this.fetchMovies();
  }

  // Method to fetch movies from backend API
  fetchMovies() {
    this.http.get<Movie[]>('https://localhost:44383/api/Movies')
      .pipe(
        catchError(err => {
          // If error occurs, display it
          console.error('API Error:', err);
          this.error = 'Failed to load movies. Make sure backend is running.';
          this.loading = false;
          return of([]); // Return empty array on error
        })
      )
      .subscribe(data => {
        this.movies = data; // Populate movies array
        this.loading = false; // Stop loading indicator
      });
  }
}
