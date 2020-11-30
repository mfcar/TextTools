import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class MinifyJSONService implements IScript {
  transform(text: string, parameters?: any[]): string {
    return JSON.stringify(JSON.parse(text));
  }
}
