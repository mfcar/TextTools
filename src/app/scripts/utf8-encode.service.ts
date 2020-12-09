import {Injectable} from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class UTF8EncodeService implements IScript {
  transform(text: string): string {
    return unescape(encodeURIComponent(text));
  }
}
