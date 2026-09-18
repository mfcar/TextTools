import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ParamSchema, ParamValue, SelectOption } from '../core/tools/param-schema';

export interface FlowRunRequest {
  readonly stepIndex: number;
  readonly stepPosition: number;
  readonly toolName: string;
  readonly param: ParamSchema;
  readonly initial: ParamValue;
}

export interface FlowRunParamsData {
  readonly flowName: string;
  readonly requests: readonly FlowRunRequest[];
}

export interface FlowRunAnswer {
  readonly stepIndex: number;
  readonly key: string;
  readonly value: ParamValue;
}

@Component({
  selector: 'app-flow-run-params-dialog',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  styleUrl: './flow-run-params-dialog.scss',
  templateUrl: './flow-run-params-dialog.html',
})
export class FlowRunParamsDialog {
  protected readonly data = inject<FlowRunParamsData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FlowRunParamsDialog, readonly FlowRunAnswer[]>);

  private readonly values = signal<Record<string, ParamValue>>(
    Object.fromEntries(this.data.requests.map((request) => [this.keyOf(request), request.initial])),
  );

  protected keyOf(request: FlowRunRequest): string {
    return `${request.stepIndex}:${request.param.key}`;
  }

  protected valueString(request: FlowRunRequest): string {
    const value = this.values()[this.keyOf(request)];
    return value === undefined ? '' : String(value);
  }

  protected valueBool(request: FlowRunRequest): boolean {
    return this.values()[this.keyOf(request)] === true;
  }

  protected setText(request: FlowRunRequest, event: Event): void {
    this.setValue(request, (event.target as HTMLInputElement).value);
  }

  protected setNumber(request: FlowRunRequest, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.setValue(request, raw === '' ? '' : Number(raw));
  }

  protected setBool(request: FlowRunRequest, checked: boolean): void {
    this.setValue(request, checked);
  }

  protected setSelect(request: FlowRunRequest, value: string): void {
    this.setValue(request, value);
  }

  protected selectOptions(param: ParamSchema): readonly SelectOption[] {
    return param.type === 'select' ? param.options : [];
  }

  protected numberMin(param: ParamSchema): number | null {
    return param.type === 'number' && param.min !== undefined ? param.min : null;
  }

  protected numberMax(param: ParamSchema): number | null {
    return param.type === 'number' && param.max !== undefined ? param.max : null;
  }

  protected numberStep(param: ParamSchema): number | null {
    return param.type === 'number' && param.step !== undefined ? param.step : null;
  }

  protected confirm(): void {
    const answers = this.data.requests.map((request) => ({
      stepIndex: request.stepIndex,
      key: request.param.key,
      value: this.values()[this.keyOf(request)],
    }));
    this.dialogRef.close(answers);
  }

  private setValue(request: FlowRunRequest, value: ParamValue): void {
    this.values.update((current) => ({ ...current, [this.keyOf(request)]: value }));
  }
}
