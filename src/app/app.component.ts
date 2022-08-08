import {Component, OnInit} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {MatDialog} from '@angular/material/dialog';
import {
  DialogUpdateApplicationVersionComponent
} from './layout/dialog-update-application-version/dialog-update-application-version.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'TextTools';

  constructor(private swUpdate: SwUpdate, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(() => {
        this.dialog.open(DialogUpdateApplicationVersionComponent, {
          width: '500px'
        });
      });
    }
  }

}
