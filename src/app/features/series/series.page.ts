import { Component } from '@angular/core';
import { MediaLibraryPageComponent } from '../library/media-library-page/media-library.page';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [MediaLibraryPageComponent],
  templateUrl: './series.page.html',
  styleUrls: ['../library/media-library-page/media-library.page.scss'],
})
export class SeriesPage {}
