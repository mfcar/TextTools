import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class TrimService implements IScript {
  transform(text: string): string {
    return text.trim();
  }
}
