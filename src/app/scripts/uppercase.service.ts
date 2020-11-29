import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class UppercaseService implements IScript {
  transform(text: string): string {
    return text.toUpperCase();
  }
}
