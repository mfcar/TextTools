import {Injectable} from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class HexadecimalDecodeService implements IScript {
  transform(text: string): string {
    let hexText = '';
    for (let e = text, t = 0; t < e.length; t += 2) {
      hexText += String.fromCharCode(parseInt(e.substr(t, 2), 16));
    }
    return hexText;
  }
}
