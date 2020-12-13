import {Component, Injector} from '@angular/core';
import {ScriptsManagerService} from '../../services/scripts-manager.service';
import {CommandHistoryManagerService} from '../../services/command-history-manager.service';
import {IScript} from '../../shared/IScript';
import {Command, Sidebar} from '../../shared/models';
import * as lodash from 'lodash';
import {MatDialog} from '@angular/material/dialog';
import {DialogDownloadFileComponent} from '../dialog-download-file/dialog-download-file.component';

@Component({
  selector: 'app-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss']
})
export class EditorCanvasComponent {
  scriptOptions: string[];
  linesNumber = 0;
  characterCount = 0;
  sidebarOpen = false;
  text = '';
  sidebarSelected: Sidebar = Sidebar.commandsList;

  constructor(private scriptManager: ScriptsManagerService,
              private historyManager: CommandHistoryManagerService,
              public dialog: MatDialog) {
    this.scriptOptions = this.scriptManager.list();
  }

  sidebarToggle(event: any): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarSelected = event.sidebar;
  }

  onCodeChanged(value: any): void {
    this.text = value;
    this.linesNumber = this.text.split('\n').length;
    this.characterCount = lodash.size(this.text);
  }

  executeTransform(event: any): void {
    const script = event.result as Command;
    const injector = Injector.create({providers: this.scriptManager.providerList()});
    const token: any = script.name;
    const service = injector.get<IScript>(token);
    this.text = service.transform(this.text, script.parametersValue);
    this.historyManager.addToHistory(script);
  }

  openDownloadFile(): void {
    const dialogRef = this.dialog.open(DialogDownloadFileComponent, {
      width: '500px',
      data: this.text
    });
  }
}
