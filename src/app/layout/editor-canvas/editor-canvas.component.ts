import {Component, Injector} from '@angular/core';
import {ScriptsManagerService} from '../../services/scripts-manager.service';
import {CommandHistoryManagerService} from '../../services/command-history-manager.service';
import {IScript} from '../../shared/IScript';
import {Command, Sidebar} from '../../shared/models';
import * as lodash from 'lodash';
import {MatDialog} from '@angular/material/dialog';
import {DialogDownloadFileComponent} from '../dialog-download-file/dialog-download-file.component';
import {DialogRenameCanvasComponent} from '../dialog-rename-canvas/dialog-rename-canvas.component';

@Component({
  selector: 'app-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss']
})
export class EditorCanvasComponent {
  canvasName = 'Editor';
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
    if (this.sidebarOpen) {
      if (this.sidebarSelected === event.sidebar) {
        this.sidebarOpen = false;
      } else {
        this.sidebarOpen = true;
      }
    } else {
      this.sidebarOpen = true;
    }
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

  openDownloadFileDialog(): void {
    const dialogRef = this.dialog.open(DialogDownloadFileComponent, {
      width: '500px',
      data: {canvasName: this.canvasName, text: this.text}
    });
  }

  openRenameCanvasDialog(): void {
    const dialogRef = this.dialog.open(DialogRenameCanvasComponent, {
      width: '500px',
      data: this.canvasName
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.canvasName = result;
      }
    });
  }
}
