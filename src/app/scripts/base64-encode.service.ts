import { Injectable } from '@angular/core';
import {ScriptService} from './scriptService';

@Injectable({
  providedIn: 'root'
})
export class Base64EncodeService implements ScriptService {
  transform(text: string): string {
    return btoa(text);
  }
}
