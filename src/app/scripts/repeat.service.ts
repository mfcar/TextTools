import { Injectable } from '@angular/core';
import * as lodash from 'lodash';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class RepeatService implements IScript {
  transform(text: string, parameters?: any[]): string {
    return lodash.repeat(text, parameters?.[0]);
  }
}
