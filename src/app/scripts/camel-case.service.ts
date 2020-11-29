import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';
import * as lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CamelCaseService implements IScript {
  transform(text: string): string {
    return lodash.camelCase(text);
  }
}
