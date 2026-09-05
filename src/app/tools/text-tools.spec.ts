import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToolParams } from '../core/tools/param-schema';
import { ToolDefinition } from '../core/tools/tool';
import { ToolRegistry, provideTools } from '../core/tools/tool-registry';
import {
  minifyJson,
  repeat,
  reverseText,
  sortLinesAsc,
  sortLinesDesc,
  split,
  trim,
} from './text-tools';

function output(tool: ToolDefinition, input: string, params: ToolParams = {}): string {
  const result = tool.run(input, params);
  if (typeof result === 'string') return result;
  if ('ok' in result && result.ok) return result.output;
  throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
}

describe('sort lines', () => {
  it('sorts ascending', () => {
    expect(output(sortLinesAsc, 'banana\napple\ncherry')).toBe('apple\nbanana\ncherry');
  });

  it('sorts descending', () => {
    expect(output(sortLinesDesc, 'apple\nbanana\ncherry')).toBe('cherry\nbanana\napple');
  });
});

describe('reverse', () => {
  it('reverses characters', () => {
    expect(output(reverseText, 'abc')).toBe('cba');
  });

  it('is code-point aware for astral characters', () => {
    expect(output(reverseText, '😀ab')).toBe('ba😀');
  });
});

describe('trim', () => {
  it('trims both ends', () => {
    expect(output(trim, '  hi  ')).toBe('hi');
  });
});

describe('split', () => {
  it('splits on a separator up to a limit', () => {
    expect(output(split, 'a-b-c-d', { separator: '-', limit: 2 })).toBe('a,b');
  });
});

describe('repeat', () => {
  it('repeats the input', () => {
    expect(output(repeat, 'ab', { times: 3 })).toBe('ababab');
  });

  it('produces an empty string for zero repeats', () => {
    expect(output(repeat, 'ab', { times: 0 })).toBe('');
  });
});

describe('minify JSON', () => {
  it('removes insignificant whitespace', () => {
    expect(output(minifyJson, '{\n  "a": 1,\n  "b": [1, 2]\n}')).toBe('{"a":1,"b":[1,2]}');
  });

  it('fails on invalid JSON', () => {
    const result = minifyJson.run('{ not json }', {});
    expect(typeof result === 'string' ? null : result).toMatchObject({ ok: false });
  });
});

describe('parameter validation via the registry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTools(split, repeat)] });
    registry = TestBed.inject(ToolRegistry);
  });

  it('applies split defaults (separator "-", limit 2)', async () => {
    expect(await registry.execute('split', 'a-b-c-d')).toEqual({ ok: true, output: 'a,b' });
  });

  it('applies the default repeat count of 3', async () => {
    expect(await registry.execute('repeat', 'x')).toEqual({ ok: true, output: 'xxx' });
  });

  it('rejects a negative repeat count', async () => {
    const result = await registry.execute('repeat', 'x', { times: -1 });
    expect(result.ok).toBe(false);
  });

  it('rejects an excessively large repeat count', async () => {
    const result = await registry.execute('repeat', 'x', { times: 1_000_000 });
    expect(result.ok).toBe(false);
  });

  it('rejects a non-integer repeat count', async () => {
    const result = await registry.execute('repeat', 'x', { times: 2.5 });
    expect(result.ok).toBe(false);
  });
});
