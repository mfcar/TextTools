import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';
import * as lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CamelCaseService implements ScriptService {

  constructor() { }

  transform(text: string): string {
    return lodash.camelCase(text);
  }
}
