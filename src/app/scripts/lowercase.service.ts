import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class LowercaseService implements IScript {
  transform(text: string): string {
    return text.toLowerCase();
  }
}
