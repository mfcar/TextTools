import {Component, Inject, OnInit} from '@angular/core';
import {ScriptManagerService} from '../script-manager.service';
import {Script} from '../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-select-command',
  templateUrl: './dialog-select-command.component.html',
  styleUrls: ['./dialog-select-command.component.scss']
})
export class DialogSelectCommandComponent implements OnInit {
  command = '';
  scriptList: Script[] = [];

  constructor(
    private scriptManager: ScriptManagerService,
    public dialogRef: MatDialogRef<DialogSelectCommandComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Script
  ) {
  }

  ngOnInit(): void {
    this.scriptList = this.scriptManager.scriptList;
  }

  commandSelected(script: Script): void {
    this.dialogRef.close(script);
  }
}
