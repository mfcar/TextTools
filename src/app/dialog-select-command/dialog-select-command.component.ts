import {Component, Inject, OnInit} from '@angular/core';
import {ScriptManagerService} from '../script-manager.service';
import {Script} from '../models';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import * as lodash from 'lodash';

@Component({
  selector: 'app-dialog-select-command',
  templateUrl: './dialog-select-command.component.html',
  styleUrls: ['./dialog-select-command.component.scss']
})
export class DialogSelectCommandComponent implements OnInit {
  command = '';
  scriptList: Script[] = [];
  filteredScript: Script[] = [];
  searchInput: FormControl = new FormControl();

  constructor(
    private scriptManager: ScriptManagerService,
    public dialogRef: MatDialogRef<DialogSelectCommandComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Script
  ) {
  }

  ngOnInit(): void {
    this.scriptList = this.scriptManager.scriptList;
    this.filteredScript = this.scriptManager.scriptList;
  }

  commandSelected(script: Script): void {
    this.dialogRef.close(script);
  }

  filterCommands(): void {
    const term = lodash.deburr(this.searchInput.value).toLowerCase();
    this.filteredScript = this.scriptList.filter(script => {
      return lodash.deburr(script.name).toLowerCase().includes(term) ||
        lodash.deburr(script.description).toLowerCase().includes(term);
    });
  }
}
