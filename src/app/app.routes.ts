import { Routes } from '@angular/router';
import { MoviesPage } from './features/movies/movies.page';
import { HomePage } from './features/home/features/home/home/home.page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePage
  },
  {
    path: 'movies',
    component: MoviesPage
  },
  {
    path: '**', // fallback for unknown routes
    redirectTo: ''
  }
];
