import { Component } from '@angular/core';
import { MediaLibraryPageComponent } from '../../library/media-library-page/media-library.page';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [MediaLibraryPageComponent],
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss']
})
export class MoviesPage {}
