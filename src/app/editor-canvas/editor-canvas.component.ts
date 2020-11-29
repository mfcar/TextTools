import {Component, InjectionToken, Injector} from '@angular/core';
import * as lodash from 'lodash';
import {FormControl} from '@angular/forms';
import {ScriptManagerService} from '../script-manager.service';
import {ScriptService} from '../scripts/scriptService';
import {HistoryManagerService} from '../services/history-manager.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogSelectCommandComponent} from '../dialog-select-command/dialog-select-command.component';
import {Script} from '../models';
import {Token} from '@angular/compiler';

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

  constructor(private scriptManager: ScriptManagerService,
              private historyManager: HistoryManagerService,
              public dialog: MatDialog) {
    this.scriptOptions = this.scriptManager.list();
  }

  commandHistorySidebarToggle(): void {
    this.commandsHistorySidebar = !this.commandsHistorySidebar;
  }

  onCodeChanged(value: any): void {
    this.text = value;
    this.linesNumber = this.text.split('\n').length;
    this.characterCount = lodash.size(this.text);
  }

  executeTransform(script: Script): void {
    const injector = Injector.create({providers: this.scriptManager.providerList()});
    const token: any = script.name;
    const service = injector.get<ScriptService>(token);
    this.text = service.transform(this.text);
    this.historyManager.addToHistory(this.commandSelected.value);
  }

  openCommandDialog(): void {
    const dialogRef = this.dialog.open(DialogSelectCommandComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeTransform(result as Script);
      }
    });
  }
}
