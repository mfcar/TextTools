import {Injectable, StaticProvider} from '@angular/core';
import {LowercaseService} from './scripts/lowercase.service';
import {UppercaseService} from './scripts/uppercase.service';
import {UrlDecodeService} from './scripts/url-decode.service';
import {UrlEncodeService} from './scripts/url-encode.service';
import {CamelCaseService} from './scripts/camel-case.service';
import {DeburrService} from './scripts/deburr.service';
import {Script} from './models';

@Injectable({
  providedIn: 'root'
})
export class ScriptManagerService {

  scriptList: Script[] = [
    {name: 'CamelCase', icon: 'title', class: CamelCaseService},
    {name: 'Deburr', icon: 'title', class: DeburrService},
    {name: 'Lowercase', icon: 'title', class: LowercaseService},
    {name: 'Uppercase', icon: 'title', class: UppercaseService},
    {name: 'URLDecode', icon: 'insert_link', class: UrlDecodeService},
    {name: 'URLEncode', icon: 'insert_link', class: UrlEncodeService}
  ];

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
