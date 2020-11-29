import {Injectable} from '@angular/core';
import {History} from '../models';

@Injectable({
  providedIn: 'root'
})
export class HistoryManagerService {
  actualHistory: History[] = [];

  addToHistory(commandName: string): void {
    const history = {
      commandName,
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
