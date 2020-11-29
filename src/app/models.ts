import {Type} from '@angular/core';
import {ScriptService} from './scripts/scriptService';

export interface Script {
  name: string;
  icon?: string;
  description?: string;
  author?: string;
  class: Type<ScriptService>;
}

export interface History {
  step: number;
  commandName: string;
  commandIcon: string;
  date: Date;
}
