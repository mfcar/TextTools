import {Component, Inject, OnInit} from '@angular/core';
import * as lodash from 'lodash';
import {Command} from '../../shared/models';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ScriptsManagerService} from '../../services/scripts-manager.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {DialogCommandParametersComponent} from '../dialog-command-parameters/dialog-command-parameters.component';

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
    @Inject(MAT_DIALOG_DATA) public data: Command,
    private bottomSheet: MatBottomSheet
  ) {
  }

  ngOnInit(): void {
    this.commandList = this.scriptManager.scriptList;
    this.filteredScript = this.scriptManager.scriptList;
  }

  filterCommands(): void {
    const term = lodash.deburr(this.searchInput.value).toLowerCase();
    this.filteredScript = this.commandList.filter(script => {
      return lodash.deburr(script.name).toLowerCase().includes(term) ||
        lodash.deburr(script.description).toLowerCase().includes(term);
    });
  }

  commandSelected(command: Command): void {
    if (command.parameters && command.parameters.length > 0) {
      const bottomRef = this.bottomSheet.open(DialogCommandParametersComponent, {
        data: command.parameters
      });

      bottomRef.afterDismissed().subscribe(result => {
        if (result) {
          command.parametersValue = result;
          this.dialogRef.close(command);
        }
      });
    } else {
      this.dialogRef.close(command);
    }
  }
}
