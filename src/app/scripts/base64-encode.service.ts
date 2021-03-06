import {Injectable} from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class Base64EncodeService implements IScript {
  transform(text: string): string {
    return btoa(text);
  }
}
