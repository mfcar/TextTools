import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';

@Injectable({
  providedIn: 'root'
})
export class LowercaseService implements ScriptService {
  description = '';
  icon = 'text';
  name = 'Lowercase';

  transform(text: string): string {
    return text.toLowerCase();
  }
}
