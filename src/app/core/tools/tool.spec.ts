import { describe, expect, it } from 'vitest';
import { ParamSchema } from './param-schema';
import { ToolResult, defineTool, failure, success } from './tool';

describe('tool result helpers', () => {
  it('success wraps output', () => {
    expect(success('hi')).toEqual<ToolResult>({ ok: true, output: 'hi' });
  });

  it('failure wraps an error', () => {
    expect(failure('nope')).toEqual<ToolResult>({ ok: false, error: 'nope' });
  });
});

describe('defineTool', () => {
  it('fills optional fields with defaults', () => {
    const tool = defineTool({
      id: 'upper',
      name: 'Uppercase',
      description: 'Uppercases the input.',
      category: 'Case',
      icon: 'text_fields',
      params: [],
      run: (input) => input.toUpperCase(),
    });

    expect(tool.tags).toEqual([]);
    expect(tool.workerEligible).toBe(false);
    expect(tool.run('abc', {})).toBe('ABC');
  });

  it('preserves provided optional fields', () => {
    const tool = defineTool({
      id: 'noop',
      name: 'No-op',
      description: 'Returns the input.',
      category: 'Misc',
      icon: 'data_object',
      tags: ['identity'],
      workerEligible: true,
      params: [],
      run: (input) => input,
    });

    expect(tool.tags).toEqual(['identity']);
    expect(tool.workerEligible).toBe(true);
  });

  it('infers strongly-typed params for run', () => {
    const params = [
      { type: 'number', key: 'times', label: 'Times', default: 2 },
      { type: 'boolean', key: 'loud', label: 'Loud', default: false },
    ] as const satisfies readonly ParamSchema[];

    const tool = defineTool({
      id: 'repeat',
      name: 'Repeat',
      description: 'Repeats the input.',
      category: 'Text',
      icon: 'repeat',
      params,
      run: (input, p) => {
        const repeated = input.repeat(p.times);
        return p.loud ? repeated.toUpperCase() : repeated;
      },
    });

    expect(tool.run('ab', { times: 3, loud: true })).toBe('ABABAB');
  });
});
