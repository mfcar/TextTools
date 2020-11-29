import {Injectable, StaticProvider} from '@angular/core';
import {ScriptList} from '../shared/scriptsList';
import {Command} from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ScriptsManagerService {

  scriptList: Command[] = ScriptList.scripts;

  public list(): string[] {
    return this.scriptList.map(x => x.name);
  }

  public providerList(): StaticProvider[] {
    const providersList: StaticProvider[] = [];
    this.scriptList.forEach(script => {
      providersList.push(this.returnProvider(script));
    });

    return providersList;
  }

  private returnProvider(command: Command): StaticProvider {
    return {provide: command.name, useClass: command.class} as StaticProvider;
  }
}
