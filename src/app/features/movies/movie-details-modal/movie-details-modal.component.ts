import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Movie } from '../../../models/movies.model';

@Component({
  selector: 'app-movie-details-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './movie-details-modal.component.html',
  styleUrls: ['./movie-details-modal.component.scss']
})
export class MovieDetailsModalComponent {
  movie = input.required<Movie>();
  closed = output<void>();

  readonly summaryFacts = computed(() => {
    const movie = this.movie();

    return [
      { label: 'Year', value: movie.year },
      { label: 'Rated', value: movie.rated },
      { label: 'Runtime', value: movie.runtime },
      { label: 'Genre', value: movie.genre },
      { label: 'Type', value: movie.type },
      { label: 'IMDb', value: movie.imdbRating }
    ].filter((fact) => fact.value);
  });

  readonly detailGroups = computed(() => {
    const movie = this.movie();

    return [
      { label: 'Released', value: movie.released },
      { label: 'Director', value: movie.director },
      { label: 'Writer', value: movie.writer },
      { label: 'Actors', value: movie.actors },
      { label: 'Language', value: movie.language },
      { label: 'Country', value: movie.country },
      { label: 'Awards', value: movie.awards },
      { label: 'Metascore', value: movie.metascore },
      { label: 'IMDb Votes', value: movie.imdbVotes },
      { label: 'DVD', value: movie.dvd },
      { label: 'Box Office', value: movie.boxOffice },
      { label: 'Production', value: movie.production },
      { label: 'IMDb ID', value: movie.imdbId }
    ].filter((detail) => detail.value);
  });

  close(): void {
    this.closed.emit();
  }
}
