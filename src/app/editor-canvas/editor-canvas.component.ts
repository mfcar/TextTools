import {Component, EventEmitter, Output} from '@angular/core';
import {CodeModel} from '@ngstack/code-editor';

@Component({
  selector: 'app-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss']
})
export class EditorCanvasComponent {
  sideBarOpen = false;

  theme = 'vs-dark';

  options = {
    contextmenu: true,
    minimap: {
      enabled: true
    }
  };

  text = '';

  constructor() {
  }

  toggleSideBar(): void {
    this.sideBarOpen = !this.sideBarOpen;
  }

  onCodeChanged(value: any): void {
    this.text = value;
  }
}
