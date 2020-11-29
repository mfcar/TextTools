import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';

@Injectable({
  providedIn: 'root'
})
export class UppercaseService implements ScriptService {
  transform(text: string): string {
    return text.toUpperCase();
  }
}
