import { Component, OnInit } from '@angular/core';
import {ScriptsManagerService} from '../../services/scripts-manager.service';
import {Command} from '../../shared/models';

@Component({
  selector: 'app-commands-list',
  templateUrl: './commands-list.component.html',
  styleUrls: ['./commands-list.component.scss']
})
export class CommandsListComponent implements OnInit {
  commandList: Command[] = [];

  constructor(
    private scriptManager: ScriptsManagerService) { }

  ngOnInit(): void {
    this.commandList = this.scriptManager.scriptList;
  }

}
