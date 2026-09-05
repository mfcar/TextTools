import { Component, signal } from '@angular/core';
import { Shell } from './layout/shell/shell';

@Component({
  imports: [Shell],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('text-tools');
}
