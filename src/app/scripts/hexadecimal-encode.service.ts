import {Injectable} from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class HexadecimalEncodeService implements IScript {
  transform(text: string): string {
    let hexText = '';
    for (let e = text, t = 0; t < e.length; t++) {
      hexText += '' + e.charCodeAt(t).toString(16);
    }
    return hexText;
  }
}
