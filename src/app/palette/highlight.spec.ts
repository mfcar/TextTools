import { describe, expect, it } from 'vitest';
import { highlightMatches } from './highlight';

describe('highlightMatches', () => {
  it('returns a single unmatched segment for an empty query', () => {
    expect(highlightMatches('Base64 Encode', '')).toEqual([
      { text: 'Base64 Encode', match: false },
    ]);
  });

  it('returns a single unmatched segment when nothing matches', () => {
    expect(highlightMatches('Uppercase', 'xyz')).toEqual([{ text: 'Uppercase', match: false }]);
  });

  it('marks a case-insensitive match and preserves surrounding text', () => {
    expect(highlightMatches('Base64 Encode', 'base')).toEqual([
      { text: 'Base', match: true },
      { text: '64 Encode', match: false },
    ]);
  });

  it('marks every whitespace-separated term', () => {
    expect(highlightMatches('Sort Lines Asc', 'sort asc')).toEqual([
      { text: 'Sort', match: true },
      { text: ' Lines ', match: false },
      { text: 'Asc', match: true },
    ]);
  });

  it('preserves significant whitespace inside unmatched segments', () => {
    const segments = highlightMatches('a b c', 'b');
    expect(segments.map((s) => s.text).join('')).toBe('a b c');
  });

  it('escapes regex-special characters in the query', () => {
    expect(highlightMatches('a.b', '.')).toEqual([
      { text: 'a', match: false },
      { text: '.', match: true },
      { text: 'b', match: false },
    ]);
  });
});
