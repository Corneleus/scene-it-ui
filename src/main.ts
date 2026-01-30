// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { MovieTableComponent } from './app/shared/movie-table/movie-table.component';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', component: MovieTableComponent },
      // add more routes here if needed
    ]),
  ],
}).catch(err => console.error(err));
