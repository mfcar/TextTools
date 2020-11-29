import { Injectable } from '@angular/core';
import {Command, CommandHistory} from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class CommandHistoryManagerService {
  actualHistory: CommandHistory[] = [];

  addToHistory(command: Command): void {
    const history = {
      commandName: command.name,
      commandIcon: command.icon,
      date: new Date(),
      step: this.getLastStepNumber()
    } as CommandHistory;
    this.actualHistory.push(history);
  }

  returnHistory(): CommandHistory[] {
    return this.actualHistory;
  }

  getLastStepNumber(): number {
    if (this.returnHistory() == null) {
      return 0;
    }

    return this.returnHistory().length;
  }
}
