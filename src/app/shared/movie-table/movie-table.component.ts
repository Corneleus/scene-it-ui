// movie-table.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../features/movies/movies.service';
import { Movie } from '../../models/movies.model';

@Component({
  selector: 'app-movie-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-table.component.html',
  styleUrls: ['./movie-table.component.scss'],
})
export class MovieTableComponent implements OnInit {
  movies: Movie[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getAllMovies().subscribe(data => {
      this.movies = data;
    });
  }
}
