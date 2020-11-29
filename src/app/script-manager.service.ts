import {Injectable} from '@angular/core';
import {LowercaseService} from './scripts/lowercase.service';
import {UppercaseService} from './scripts/uppercase.service';

@Injectable({
  providedIn: 'root'
})
export class ScriptManagerService {

  constructor() { }

  public list(): string[] {
    const scriptList = ['Lowercase', 'Uppercase'];
    return scriptList;
  }

  public providerList(): any[] {
    const providersList = [
      { provide: 'Lowercase', useClass: LowercaseService },
      { provide: 'Uppercase', useClass: UppercaseService}
    ];

    return providersList;
  }
}
