import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { defineTool, failure } from './tool';
import { ToolRegistry, provideTools } from './tool-registry';

const upper = defineTool({
  id: 'upper',
  name: 'Uppercase',
  description: 'Uppercases text.',
  category: 'Case',
  tags: ['transform'],
  icon: 'text_fields',
  params: [],
  run: (input) => input.toUpperCase(),
});

const reverse = defineTool({
  id: 'reverse',
  name: 'Reverse',
  description: 'Reverses text.',
  category: 'Case',
  icon: 'swap_horiz',
  params: [],
  run: (input) => [...input].reverse().join(''),
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

const asyncTool = defineTool({
  id: 'async-echo',
  name: 'Async echo',
  description: 'Echoes asynchronously.',
  category: 'Text',
  icon: 'sync',
  params: [],
  run: (input) => Promise.resolve(input),
});

const failingResult = defineTool({
  id: 'fails-result',
  name: 'Fails via result',
  description: 'Returns a failure result.',
  category: 'Text',
  icon: 'error',
  params: [],
  run: () => failure('cannot process'),
});

const throwingTool = defineTool({
  id: 'throws',
  name: 'Throws',
  description: 'Throws an error.',
  category: 'Text',
  icon: 'warning',
  params: [],
  run: () => {
    throw new Error('boom');
  },
});

function createRegistry(): ToolRegistry {
  TestBed.configureTestingModule({
    providers: [provideTools(upper, reverse, repeat, asyncTool, failingResult, throwingTool)],
  });
  return TestBed.inject(ToolRegistry);
}

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = createRegistry();
  });

  it('registers provided tools', () => {
    expect(registry.has('upper')).toBe(true);
    expect(registry.get('reverse')?.name).toBe('Reverse');
    expect(registry.all()).toHaveLength(6);
  });

  it('throws when registering a duplicate id', () => {
    expect(() => registry.register(upper)).toThrowError(/already registered/);
  });

  it('lists distinct sorted categories', () => {
    expect(registry.categories()).toEqual(['Case', 'Text']);
  });

  it('groups tools by category', () => {
    const groups = registry.byCategory();

    expect(groups.map((group) => group.category)).toEqual(['Case', 'Text']);
    expect(groups[0].tools.map((tool) => tool.id)).toEqual(['upper', 'reverse']);
  });

  describe('search', () => {
    it('returns everything for a blank query', () => {
      expect(registry.search('   ')).toHaveLength(6);
    });

    it('matches across metadata fields case-insensitively', () => {
      expect(registry.search('uppercase').map((tool) => tool.id)).toEqual(['upper']);
      expect(registry.search('transform').map((tool) => tool.id)).toEqual(['upper']);
    });

    it('requires every term to match', () => {
      expect(registry.search('reverse case').map((tool) => tool.id)).toEqual(['reverse']);
      expect(registry.search('reverse repeat')).toEqual([]);
    });
  });

  describe('execute', () => {
    it('runs a tool and wraps a string result in success', async () => {
      expect(await registry.execute('upper', 'abc')).toEqual({ ok: true, output: 'ABC' });
    });

    it('awaits async tools', async () => {
      expect(await registry.execute('async-echo', 'hi')).toEqual({ ok: true, output: 'hi' });
    });

    it('validates params before running, using defaults', async () => {
      expect(await registry.execute('repeat', 'ab', { times: 3 })).toEqual({
        ok: true,
        output: 'ababab',
      });
    });

    it('fails on invalid params without running', async () => {
      const result = await registry.execute('repeat', 'ab', { times: 0 });

      expect(result.ok).toBe(false);
    });

    it('passes through an explicit failure result', async () => {
      expect(await registry.execute('fails-result', 'x')).toEqual({
        ok: false,
        error: 'cannot process',
      });
    });

    it('converts a thrown error into a failure', async () => {
      expect(await registry.execute('throws', 'x')).toEqual({ ok: false, error: 'boom' });
    });

    it('fails for an unknown tool id', async () => {
      const result = await registry.execute('missing', 'x');

      expect(result.ok).toBe(false);
    });
  });
});
