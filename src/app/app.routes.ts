// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MoviesPage } from './features/movies/movies.page';
import { AppComponent } from './app';

export const routes: Routes = [
  //{ path: '', component: AppComponent,  pathMatch: 'full' },       // Landing page
  { path: 'movies', component: MoviesPage },   // Movies page
  { path: '**', redirectTo: '' } // landing page
];
