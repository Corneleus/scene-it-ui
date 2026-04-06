import { Component } from '@angular/core';
import { MediaLibraryPageComponent } from '../library/media-library-page/media-library.page';

@Component({
  selector: 'app-video-games',
  standalone: true,
  imports: [MediaLibraryPageComponent],
  templateUrl: './video-games.page.html',
  styleUrls: ['../library/media-library-page/media-library.page.scss'],
})
export class VideoGamesPage {}
