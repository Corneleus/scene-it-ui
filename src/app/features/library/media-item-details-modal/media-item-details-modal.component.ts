import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, HostListener, input, output } from '@angular/core';
import { MediaItem } from '../../../models/media-item.model';
import { FALLBACK_POSTER_SRC, replaceBrokenPoster } from '../poster-fallback';

@Component({
  selector: 'app-media-item-details-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './media-item-details-modal.component.html',
  styleUrls: ['./media-item-details-modal.component.scss']
})
export class MediaItemDetailsModalComponent {
  readonly fallbackPosterSrc = FALLBACK_POSTER_SRC;
  readonly replaceBrokenPoster = replaceBrokenPoster;
  item = input.required<MediaItem>();
  detailTitle = input('Media Item Details');
  closed = output<void>();

  readonly summaryFacts = computed(() => {
    const item = this.item();

    return [
      { label: 'Year', value: item.year },
      { label: 'Rated', value: item.rated },
      { label: 'Runtime', value: item.runtime },
      { label: 'Genre', value: item.genre },
      { label: 'Type', value: item.type },
      { label: 'IMDb', value: item.imdbRating }
    ].filter((fact) => fact.value);
  });

  readonly detailGroups = computed(() => {
    const item = this.item();

    return [
      { label: 'Released', value: item.released },
      { label: 'Director', value: item.director },
      { label: 'Writer', value: item.writer },
      { label: 'Actors', value: item.actors },
      { label: 'Language', value: item.language },
      { label: 'Country', value: item.country },
      { label: 'Awards', value: item.awards },
      { label: 'Metascore', value: item.metascore },
      { label: 'IMDb Votes', value: item.imdbVotes },
      { label: 'DVD', value: item.dvd },
      { label: 'Box Office', value: item.boxOffice },
      { label: 'Production', value: item.production },
      { label: 'IMDb ID', value: item.imdbId }
    ].filter((detail) => detail.value);
  });

  close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
