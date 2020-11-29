import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';

@Injectable({
  providedIn: 'root'
})
export class UrlEncodeService implements ScriptService {
  description = '';
  icon = 'insert-link';
  name = 'URL Encode';

  transform(text: string): string {
    return encodeURIComponent(text);
  }
}
