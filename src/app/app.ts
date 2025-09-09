import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  imports: [
    RouterOutlet
  ],
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
    }
  `]
})
export class App {}
