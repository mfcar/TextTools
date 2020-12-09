import {Injectable} from '@angular/core';
import {IScript} from '../shared/IScript';

@Injectable({
  providedIn: 'root'
})
export class TextReverseService implements IScript {
  transform(text: string, parameters?: any[]): string {
    return text.split('').reverse().join('');
  }
}
