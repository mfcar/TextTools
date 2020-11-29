import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';

@Injectable({
  providedIn: 'root'
})
export class UrlDecodeService implements ScriptService {
  transform(text: string): string {
    return decodeURIComponent(text);
  }
}
