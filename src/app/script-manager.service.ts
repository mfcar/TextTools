import {Injectable, StaticProvider, Type} from '@angular/core';
import {LowercaseService} from './scripts/lowercase.service';
import {UppercaseService} from './scripts/uppercase.service';
import {ScriptService} from './scripts/scriptService';

interface Script {
  name: string;
  class: Type<ScriptService>;
}

@Injectable({
  providedIn: 'root'
})
export class ScriptManagerService {

  scriptList: Script[] = [
    {name: 'Lowercase', class: LowercaseService},
    {name: 'Uppercase', class: UppercaseService}
  ];

  constructor() {
  }

  public list(): string[] {
    const scripts = this.scriptList.map(x => x.name);

    return scripts;
  }

  public providerList(): StaticProvider[] {
    const providersList: StaticProvider[] = [];
    this.scriptList.forEach(script => {
      providersList.push(this.returnProvider(script));
    });

    return providersList;
  }

  private returnProvider(script: Script): StaticProvider {
    return {provide: script.name, useClass: script.class} as StaticProvider;
  }
}
