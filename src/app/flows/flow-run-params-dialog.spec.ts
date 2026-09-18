import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, expect, it, vi } from 'vitest';
import { FlowRunParamsData, FlowRunParamsDialog } from './flow-run-params-dialog';

describe('FlowRunParamsDialog', () => {
  it('collects edited values and returns them on confirm', () => {
    const close = vi.fn();
    const data: FlowRunParamsData = {
      flowName: 'Demo',
      requests: [
        {
          stepIndex: 0,
          stepPosition: 1,
          toolName: 'Append',
          param: { type: 'text', key: 's', label: 'Suffix', default: 'x' },
          initial: 'x',
        },
        {
          stepIndex: 2,
          stepPosition: 3,
          toolName: 'Repeat',
          param: { type: 'number', key: 'n', label: 'Times', default: 2 },
          initial: 2,
        },
      ],
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const component = TestBed.createComponent(FlowRunParamsDialog).componentInstance;

    component['setText'](data.requests[0], { target: { value: '!!' } } as unknown as Event);
    component['confirm']();

    expect(close).toHaveBeenCalledWith([
      { stepIndex: 0, key: 's', value: '!!' },
      { stepIndex: 2, key: 'n', value: 2 },
    ]);
  });
});
