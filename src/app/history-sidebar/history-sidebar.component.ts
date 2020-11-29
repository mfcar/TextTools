import { Component, OnInit } from '@angular/core';
import {HistoryManagerService} from '../services/history-manager.service';
import {History} from '../models';

@Component({
  selector: 'app-history-sidebar',
  templateUrl: './history-sidebar.component.html',
  styleUrls: ['./history-sidebar.component.scss']
})
export class HistorySidebarComponent implements OnInit {
  historyCommandList: History[] = [];

  constructor(private historyManager: HistoryManagerService) { }

  ngOnInit(): void {
    this.historyCommandList = this.historyManager.returnHistory();
  }

}
