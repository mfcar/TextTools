import {Injectable, StaticProvider, Type} from '@angular/core';
import {LowercaseService} from './scripts/lowercase.service';
import {UppercaseService} from './scripts/uppercase.service';
import {ScriptService} from './scripts/scriptService';
import {UrlDecodeService} from './scripts/url-decode.service';
import {UrlEncodeService} from './scripts/url-encode.service';
import {CamelCaseService} from './scripts/camel-case.service';
import {DeburrService} from './scripts/deburr.service';

interface Script {
  name: string;
  class: Type<ScriptService>;
}

@Injectable({
  providedIn: 'root'
})
export class ScriptManagerService {

  scriptList: Script[] = [
    {name: 'CamelCase', class: CamelCaseService},
    {name: 'Deburr', class: DeburrService},
    {name: 'Lowercase', class: LowercaseService},
    {name: 'Uppercase', class: UppercaseService},
    {name: 'URLDecode', class: UrlDecodeService},
    {name: 'URLEncode', class: UrlEncodeService}
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
