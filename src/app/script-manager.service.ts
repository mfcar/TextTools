import {Injectable, StaticProvider} from '@angular/core';
import {Script} from './models';
import {ScriptList} from './scriptListJson';

@Injectable({
  providedIn: 'root'
})
export class ScriptManagerService {

  scriptList: Script[] = ScriptList.scripts;

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
