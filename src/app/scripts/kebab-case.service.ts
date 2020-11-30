import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';
import * as lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class KebabCaseService implements IScript {
  transform(text: string, parameters?: any[]): string {
    return lodash.kebabCase(text);
  }
}
