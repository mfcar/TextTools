import {Injectable} from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class UTF8DecodeService implements IScript {
  transform(text: string): string {
    return decodeURIComponent( escape( text ) );
  }
}