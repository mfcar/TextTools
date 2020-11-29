import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class IScript {
  abstract transform(text: string): string;
}
