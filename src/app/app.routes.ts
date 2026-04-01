import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home.page';
import { MoviesPage } from './features/movies/movie-page/movies.page';

export const routes: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' }, // Landing page
  { path: 'movies', component: MoviesPage }                       // Movies page
];
