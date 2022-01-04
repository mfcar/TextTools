import {Component} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-dialog-update-application-version',
  templateUrl: './dialog-update-application-version.component.html',
  styleUrls: ['./dialog-update-application-version.component.scss']
})
export class DialogUpdateApplicationVersionComponent {

  constructor(private swUpdate: SwUpdate) {
  }

  onUpdateUpdate(): void {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
