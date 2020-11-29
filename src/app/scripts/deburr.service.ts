import { Injectable } from '@angular/core';
import * as lodash from 'lodash';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class DeburrService implements IScript {
  transform(text: string): string {
    return lodash.deburr(text);
  }
}
