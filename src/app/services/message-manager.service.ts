import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageManagerService {

  public duration = 10000;
  public horizontalP: MatSnackBarHorizontalPosition = 'center';
  public verticalP: MatSnackBarVerticalPosition = 'top';

  constructor(private snackBar: MatSnackBar) { }

  showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: this.duration,
      horizontalPosition: this.horizontalP,
      verticalPosition: this.verticalP
    });
  }
}
