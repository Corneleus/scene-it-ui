// src/app/features/movies/movie-table.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../movies.service';
import { Movie } from '../../../models/movies.model';


@Component({
  selector: 'app-movie-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-table.component.html',
  styleUrls: ['./movie-table.component.scss']
})
export class MovieTableComponent implements OnInit {
  movies: Movie[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    console.log('🔥 MovieTableComponent INIT');
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getAllMovies().subscribe({
      next: (data) => {
        this.movies = data;
        console.log('🎬 Movies loaded:', this.movies.length);
      },
      error: (err) => {
        console.error('⚠️ Error loading movies:', err);
      }
    });
  }
}
