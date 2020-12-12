import {Component, OnInit} from '@angular/core';
import {CommandHistoryManagerService} from '../../services/command-history-manager.service';
import {CommandHistory} from '../../shared/models';

@Component({
  selector: 'app-sidebar-history',
  templateUrl: './sidebar-history.component.html',
  styleUrls: ['./sidebar-history.component.scss']
})
export class SidebarHistoryComponent implements OnInit {
  historyCommandList: CommandHistory[] = [];

  constructor(private historyManager: CommandHistoryManagerService) {
  }

  ngOnInit(): void {
    this.historyCommandList = this.historyManager.returnHistory();
  }

  clearHistory(): void {
    this.historyManager.clearHistory();
  }

}
