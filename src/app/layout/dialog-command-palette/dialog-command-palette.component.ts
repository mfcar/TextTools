import {Component, Inject, OnInit} from '@angular/core';
import * as lodash from 'lodash';
import {Command} from '../../shared/models';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ScriptsManagerService} from '../../services/scripts-manager.service';

@Component({
  selector: 'app-dialog-command-palette',
  templateUrl: './dialog-command-palette.component.html',
  styleUrls: ['./dialog-command-palette.component.scss']
})
export class DialogCommandPaletteComponent implements OnInit {
  command = '';
  commandList: Command[] = [];
  filteredScript: Command[] = [];
  searchInput: FormControl = new FormControl();

  constructor(
    private scriptManager: ScriptsManagerService,
    public dialogRef: MatDialogRef<DialogCommandPaletteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Command
  ) {
  }

  ngOnInit(): void {
    this.commandList = this.scriptManager.scriptList;
    this.filteredScript = this.scriptManager.scriptList;
  }

  commandSelected(command: Command): void {
    this.dialogRef.close(command);
  }

  filterCommands(): void {
    const term = lodash.deburr(this.searchInput.value).toLowerCase();
    this.filteredScript = this.commandList.filter(script => {
      return lodash.deburr(script.name).toLowerCase().includes(term) ||
        lodash.deburr(script.description).toLowerCase().includes(term);
    });
  }
}
