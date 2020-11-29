import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';
import * as lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class DeburrService implements ScriptService {
  transform(text: string): string {
    return lodash.deburr(text);
  }
}
