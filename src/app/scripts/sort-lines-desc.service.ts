import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class SortLinesDescService implements IScript {
  transform(text: string, parameters?: any[]): string {
    return text.split('\n').reverse().join('\n');
  }
}
