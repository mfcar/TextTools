import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class ScriptService {
  name: string | undefined;
  icon: string | undefined;
  description: string | undefined;

  abstract transform(text: string): string;
}
