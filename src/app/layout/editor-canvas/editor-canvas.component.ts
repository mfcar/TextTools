import {Component, Injector} from '@angular/core';
import {ScriptsManagerService} from '../../services/scripts-manager.service';
import {CommandHistoryManagerService} from '../../services/command-history-manager.service';
import {IScript} from '../../shared/IScript';
import {Command} from '../../shared/models';
import * as lodash from 'lodash';

@Component({
  selector: 'app-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss']
})
export class EditorCanvasComponent {
  scriptOptions: string[];
  linesNumber = 0;
  characterCount = 0;
  commandsHistorySidebar = false;
  text = '';

  constructor(private scriptManager: ScriptsManagerService,
              private historyManager: CommandHistoryManagerService) {
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

  executeTransform(event: any): void{
    const script = event.result as Command;
    const injector = Injector.create({providers: this.scriptManager.providerList()});
    const token: any = script.name;
    const service = injector.get<IScript>(token);
    this.text = service.transform(this.text);
    this.historyManager.addToHistory(script);
  }
}
