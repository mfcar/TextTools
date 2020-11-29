import {Component, Injector} from '@angular/core';
import * as lodash from 'lodash';
import {FormControl} from '@angular/forms';
import {ScriptManagerService} from '../script-manager.service';
import {ScriptService} from '../scripts/scriptService';

export interface User {
  name: string;
}

@Component({
  selector: 'app-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss']
})
export class EditorCanvasComponent {
  commandSelected = new FormControl();
  scriptOptions: string[];
  linesNumber = 0;
  characterCount = 0;
  commandsHistorySidebar = false;
  text = '';

  constructor(private scriptManager: ScriptManagerService) {
    this.scriptOptions = this.scriptManager.list();
  }

  commandHistorySidebarToggler(): void {
    this.commandsHistorySidebar = !this.commandsHistorySidebar;
  }

  onCodeChanged(value: any): void {
    this.text = value;
    this.linesNumber = this.text.split('\n').length;
    this.characterCount = lodash.size(this.text);
  }

  executeTransform(): void {
    const injector = Injector.create({providers: this.scriptManager.providerList()});

    const service = injector.get<ScriptService>(this.commandSelected.value);
    this.text = service.transform(this.text);
  }
}
