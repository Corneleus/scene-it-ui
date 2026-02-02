import { Component, signal, effect } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  /** Search box value */
  searchQuery = signal('');

  /** Dynamic title shown in the header */
  title = signal('Welcome to SceneIt');

  constructor(private router: Router) {
    // Use a signal effect to react to route changes
    effect(() => {
      // Subscribe reactively to NavigationEnd events
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(event => {
          // Update the title signal automatically
          this.title.set(
            event.urlAfterRedirects.startsWith('/movies')
              ? 'SceneIt Movies'
              : 'Welcome to SceneIt'
          );
        });
    });
  }
}
