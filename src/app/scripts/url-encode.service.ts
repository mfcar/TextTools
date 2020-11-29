import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';

@Injectable({
  providedIn: 'root'
})
export class UrlEncodeService implements ScriptService {

  constructor() { }

  transform(text: string): string {
    return encodeURIComponent(text);
  }
}
