import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';
import * as lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class EscapeService implements IScript{
  transform(text: string, parameters?: any[]): string {
    return lodash.escape(text);
  }
}
