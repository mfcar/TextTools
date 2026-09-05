import { describe, expect, it } from 'vitest';
import { ToolDefinition } from '../core/tools/tool';
import { camelCase, deburrTool, kebabCase, lowercase, snakeCase, uppercase } from './case-tools';

function run(tool: ToolDefinition, input: string): string {
  const result = tool.run(input, {});
  if (typeof result !== 'string') {
    throw new Error('Case tools should return a string.');
  }
  return result;
}

describe('uppercase / lowercase', () => {
  it('changes case', () => {
    expect(run(uppercase, 'Hello World')).toBe('HELLO WORLD');
    expect(run(lowercase, 'Hello World')).toBe('hello world');
  });
});

describe('camelCase', () => {
  it.each([
    ['Foo Bar', 'fooBar'],
    ['--foo-bar--', 'fooBar'],
    ['__FOO_BAR__', 'fooBar'],
    ['foo2bar', 'foo2Bar'],
    ['', ''],
  ])('%j -> %j', (input, expected) => {
    expect(run(camelCase, input)).toBe(expected);
  });
});

describe('kebabCase', () => {
  it.each([
    ['fooBar', 'foo-bar'],
    ['Foo Bar', 'foo-bar'],
    ['__FOO_BAR__', 'foo-bar'],
  ])('%j -> %j', (input, expected) => {
    expect(run(kebabCase, input)).toBe(expected);
  });
});

describe('snakeCase', () => {
  it.each([
    ['fooBar', 'foo_bar'],
    ['Foo Bar', 'foo_bar'],
    ['foo2bar', 'foo_2_bar'],
  ])('%j -> %j', (input, expected) => {
    expect(run(snakeCase, input)).toBe(expected);
  });
});

describe('deburr', () => {
  it('removes accents', () => {
    expect(run(deburrTool, 'déjà vu — café')).toBe('deja vu — cafe');
  });
});
