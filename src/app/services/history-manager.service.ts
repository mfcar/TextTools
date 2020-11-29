import {Injectable} from '@angular/core';
import {History, Script} from '../models';

@Injectable({
  providedIn: 'root'
})
export class HistoryManagerService {
  actualHistory: History[] = [];

  addToHistory(script: Script): void {
    const history = {
      commandName: script.name,
      commandIcon: script.icon,
      date: new Date(),
      step: this.getLastStepNumber()
    } as History;
    this.actualHistory.push(history);
  }

  returnHistory(): History[] {
    return this.actualHistory;
  }

  getLastStepNumber(): number {
    if (this.returnHistory() == null) {
      return 0;
    }

    return this.returnHistory().length;
  }
}
