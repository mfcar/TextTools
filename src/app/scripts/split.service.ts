import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';
import * as lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SplitService implements IScript {
  transform(text: string, parameters?: any[]): string {
    return lodash.split(text, parameters?.[0], parameters?.[1]).toString();
  }
}
