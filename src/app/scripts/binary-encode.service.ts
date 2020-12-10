import {Injectable} from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class BinaryEncodeService implements IScript {

  private static padding_left(e: string, a: string, t: number): string {
    if (!e || !a || e.length >= t) {
      return e;
    }
    for (let r = (t - e.length) / a.length, i = 0; i < r; i++) {
      e = a + e;
    }
    return e;
  }

  transform(text: string): string {
    let e: number;
    let a: number;
    const t = text;
    const r = [];
    let i = '';
    for (e = 0; e < t.length; e++) {
      r.push(t[e].charCodeAt(0).toString(2));
    }
    for (a = 0; a < r.length; a++) {
      i += BinaryEncodeService.padding_left(r[a], '0', 8) + ' ';
    }

    return i;
  }
}
