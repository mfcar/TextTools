import {Component} from '@angular/core';
import * as lodash from 'lodash';
import {FormControl} from '@angular/forms';

export interface User {
  name: string;
}

@Component({
  selector: 'app-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss']
})
export class EditorCanvasComponent  {
  commandSelected = new FormControl();
  options: string[] = ['Reverse string', 'Encode URL', 'Decode URL'];
  linesNumber = 0;
  characterCount = 0;
  commandsHistorySidebar = false;

  theme = 'vs-dark';

  editorOptions = {
    contextmenu: true,
    minimap: {
      enabled: true
    }
  };

  text = '';

  commandHistorySidebarToggler(): void {
    this.commandsHistorySidebar = !this.commandsHistorySidebar;
  }

  onCodeChanged(value: any): void {
    this.text = value;
    this.linesNumber = this.text.split('\n').length;
    this.characterCount = lodash.size(this.text);
  }
}
