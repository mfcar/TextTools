import { Injectable } from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class UrlEncodeService implements IScript {
  transform(text: string): string {
    return encodeURIComponent(text);
  }
}
