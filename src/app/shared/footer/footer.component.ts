import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,

  // CommonModule is needed for basic Angular directives
  // RouterModule allows routerLink usage if you add links later
  imports: [CommonModule],

  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  // Current year shown in the footer
  readonly currentYear = new Date().getFullYear();
}
