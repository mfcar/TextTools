import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss']
})
export class EditorCanvasComponent {
  sideBarOpen = false;

  constructor() {
  }

  toggleSideBar(): void {
    this.sideBarOpen = !this.sideBarOpen;
  }
}
