// src/app/app.ts
import { Component, signal } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {

  title = 'Welcome to SceneIt';
  
  searchQuery = signal('');

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(event => {
        this.title = event.urlAfterRedirects.startsWith('/movies')
          ? 'SceneIt Movies'
          : 'Welcome to SceneIt';
      });
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
  }
}
