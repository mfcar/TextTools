import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class ScriptService {
  abstract transform(text: string): string;
}
