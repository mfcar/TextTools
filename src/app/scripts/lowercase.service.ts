import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';

@Injectable({
  providedIn: 'root'
})
export class LowercaseService extends ScriptService {

  transform(text: string): string {
    return text.toLowerCase();
  }
}
