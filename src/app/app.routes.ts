import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.page').then((module) => module.HomePageComponent),
  },
  {
    path: 'movies',
    loadComponent: () =>
      import('./features/movies/movie-page/movies.page').then((module) => module.MoviesPage),
  },
  {
    path: 'imports',
    loadComponent: () =>
      import('./features/imports/imports.page').then((module) => module.ImportsPage),
  },
];
