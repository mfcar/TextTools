import { describe, expect, it } from 'vitest';
import { ToolParams } from '../core/tools/param-schema';
import { ToolDefinition } from '../core/tools/tool';
import {
  countText,
  loremIpsum,
  naturalSortLines,
  removeDuplicateLines,
  replaceSmartQuotes,
  rot13,
  shuffleLines,
  slugify,
} from './text-utility-tools';

function output(tool: ToolDefinition, input: string, params: ToolParams = {}): string {
  const result = tool.run(input, params);
  if (typeof result === 'string') return result;
  if ('ok' in result && result.ok) return result.output;
  throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
}

describe('Remove duplicate lines', () => {
  it('keeps the first occurrence in order', () => {
    expect(output(removeDuplicateLines, 'a\nb\na\nc\nb')).toBe('a\nb\nc');
  });
});

describe('Shuffle lines', () => {
  it('produces a permutation of the input lines', () => {
    const lines = ['a', 'b', 'c', 'd', 'e'];
    const result = output(shuffleLines, lines.join('\n')).split('\n');
    expect([...result].sort()).toEqual([...lines].sort());
  });
});

describe('Natural sort lines', () => {
  it('orders embedded numbers by value', () => {
    expect(output(naturalSortLines, 'item10\nitem2\nitem1')).toBe('item1\nitem2\nitem10');
  });
});

describe('Count text', () => {
  it('reports characters, words, and lines', () => {
    expect(output(countText, 'hello world\nsecond line')).toBe(
      'Characters: 23\nCharacters (no spaces): 20\nWords: 4\nLines: 2',
    );
  });

  it('reports zeros for empty input', () => {
    expect(output(countText, '')).toBe(
      'Characters: 0\nCharacters (no spaces): 0\nWords: 0\nLines: 0',
    );
  });
});

describe('Lorem ipsum', () => {
  it('generates the requested number of paragraphs', () => {
    const result = output(loremIpsum, '', { paragraphs: 2, sentences: 3 });
    const paragraphs = result.split('\n\n');
    expect(paragraphs).toHaveLength(2);
    expect(result.startsWith('Lorem')).toBe(true);
  });
});

describe('ROT13', () => {
  it('is its own inverse', () => {
    expect(output(rot13, 'Hello, World!')).toBe('Uryyb, Jbeyq!');
    expect(output(rot13, output(rot13, 'Hello, World!'))).toBe('Hello, World!');
  });
});

describe('Slugify', () => {
  it('produces a url-friendly slug', () => {
    expect(output(slugify, '  Héllo, World! ')).toBe('hello-world');
  });
});

describe('Replace smart quotes', () => {
  it('replaces curly quotes, dashes, and ellipses', () => {
    expect(output(replaceSmartQuotes, '“hi” ‘there’ — wait…')).toBe('"hi" \'there\' - wait...');
  });
});
