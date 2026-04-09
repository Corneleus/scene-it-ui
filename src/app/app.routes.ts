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
    path: 'series',
    loadComponent: () =>
      import('./features/series/series.page').then((module) => module.SeriesPage),
  },
  {
    path: 'video-games',
    loadComponent: () =>
      import('./features/video-games/video-games.page').then((module) => module.VideoGamesPage),
  },
  {
    path: 'comics',
    loadComponent: () =>
      import('./features/comics/comics.page').then((module) => module.ComicsPage),
  },
  {
    path: 'cookbook',
    loadComponent: () =>
      import('./features/cookbook/cookbook.page').then((module) => module.CookbookPage),
  },
  {
    path: 'imports',
    loadComponent: () =>
      import('./features/imports/imports.page').then((module) => module.ImportsPage),
  },
];
