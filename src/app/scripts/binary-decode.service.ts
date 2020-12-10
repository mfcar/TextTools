import {Injectable} from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class BinaryDecodeService implements IScript {
  transform(text: string): string {
    let e = text;
    let a = '';
    if ((e = e.replace(/\s/g, '')).length % 8 !== 0) {
      a = '???:';
    } else {
      for (; e.length > 0;) {
        const t = e.substring(0, 8);
        e = e.substring(8);
        const r = parseInt(t, 2);
        a += String.fromCharCode(r);
      }
    }
    return a;
  }
}
