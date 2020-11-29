import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';

@Injectable({
  providedIn: 'root'
})
export class UppercaseService implements ScriptService {
  description = '';
  icon = 'text';
  name = 'Uppercase';

  transform(text: string): string {
    return text.toUpperCase();
  }
}
