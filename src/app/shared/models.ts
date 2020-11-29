import {Type} from '@angular/core';
import {IScript} from './IScript';

export interface Command {
  name: string;
  icon?: string;
  description?: string;
  author?: string;
  class: Type<IScript>;
}

export interface CommandHistory {
  step: number;
  commandName: string;
  commandIcon: string;
  date: Date;
}
