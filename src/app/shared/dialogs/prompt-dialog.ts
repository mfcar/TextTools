import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface PromptDialogData {
  readonly title: string;
  readonly label: string;
  readonly value?: string;
  readonly confirmLabel?: string;
}

@Component({
  selector: 'app-prompt-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>{{ data.label }}</mat-label>
        <input
          matInput
          [value]="value()"
          (input)="value.set($any($event.target).value)"
          (keydown.enter)="confirm()"
          cdkFocusInitial
        />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Cancel</button>
      <button matButton="filled" (click)="confirm()" [disabled]="!value().trim()">
        {{ data.confirmLabel ?? 'OK' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class PromptDialog {
  protected readonly data = inject<PromptDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PromptDialog, string>);
  protected readonly value = signal(this.data.value ?? '');

  protected confirm(): void {
    const name = this.value().trim();
    if (name) {
      this.dialogRef.close(name);
    }
  }
}
