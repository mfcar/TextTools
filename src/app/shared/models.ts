import {Type} from '@angular/core';
import {IScript} from './IScript';

export interface Command {
  name: string;
  icon?: string;
  description?: string;
  author?: string;
  class: Type<IScript>;
  parameters?: CommandParameter[];
  parametersValue: any[];
}

export interface CommandParameter {
  index: number;
  name: string;
  type: ParameterType;
  defaultValue: any;
}

export interface CommandHistory {
  step: number;
  commandName: string;
  commandIcon: string;
  date: Date;
}

export enum ParameterType {
  text,
  number
}
