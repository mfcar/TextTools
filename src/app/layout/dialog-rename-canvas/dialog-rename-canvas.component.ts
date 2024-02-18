import {Component, Inject} from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-rename-canvas',
  templateUrl: './dialog-rename-canvas.component.html',
  styleUrls: ['./dialog-rename-canvas.component.scss']
})
export class DialogRenameCanvasComponent {
  public actualName = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {
    this.actualName = this.data;
  }
}
