import { describe, expect, it } from 'vitest';
import { executeTool } from './execute-tool';
import { defineTool, failure } from './tool';

const upper = defineTool({
  id: 'upper',
  name: 'Uppercase',
  description: 'Uppercases text.',
  category: 'Case',
  icon: 'text_fields',
  params: [],
  run: (input) => input.toUpperCase(),
});

const repeat = defineTool({
  id: 'repeat',
  name: 'Repeat',
  description: 'Repeats text.',
  category: 'Text',
  icon: 'repeat',
  params: [{ type: 'number', key: 'times', label: 'Times', default: 1, integer: true, min: 1 }],
  run: (input, params) => input.repeat(params.times),
});

const failing = defineTool({
  id: 'fails',
  name: 'Fails',
  description: 'Returns a failure.',
  category: 'Text',
  icon: 'error',
  params: [],
  run: () => failure('nope'),
});

const throwing = defineTool({
  id: 'throws',
  name: 'Throws',
  description: 'Throws.',
  category: 'Text',
  icon: 'warning',
  params: [],
  run: () => {
    throw new Error('boom');
  },
});

describe('executeTool', () => {
  it('wraps a string result in success', async () => {
    expect(await executeTool(upper, 'abc')).toEqual({ ok: true, output: 'ABC' });
  });

  it('validates params before running, applying defaults', async () => {
    expect(await executeTool(repeat, 'ab', { times: 3 })).toEqual({ ok: true, output: 'ababab' });
  });

  it('fails on invalid params without running', async () => {
    const result = await executeTool(repeat, 'ab', { times: 0 });
    expect(result.ok).toBe(false);
  });

  it('passes through an explicit failure result', async () => {
    expect(await executeTool(failing, 'x')).toEqual({ ok: false, error: 'nope' });
  });

  it('converts a thrown error into a failure', async () => {
    expect(await executeTool(throwing, 'x')).toEqual({ ok: false, error: 'boom' });
  });
});
