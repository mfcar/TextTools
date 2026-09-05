import { Component, signal } from '@angular/core';
import { Shell } from './layout/shell/shell';
import { Workspace } from './workspace/workspace';

@Component({
  imports: [Shell, Workspace],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('text-tools');
}
