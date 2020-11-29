import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class UrlDecodeService implements IScript {
  transform(text: string): string {
    return decodeURIComponent(text);
  }
}
