import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';
import * as lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CamelCaseService implements ScriptService {
  name = 'Camel Case';
  icon = 'title';
  description = '';

  transform(text: string): string {
    return lodash.camelCase(text);
  }
}
