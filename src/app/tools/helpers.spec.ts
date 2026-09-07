import { describe, expect, it } from 'vitest';
import {
  binaryStringToBytes,
  bytesToBinaryString,
  deburr,
  escapeHtml,
  fromUtf8Bytes,
  toUtf8Bytes,
  toWords,
} from './helpers';

describe('UTF-8 byte helpers', () => {
  it('round-trips ASCII and Unicode through bytes', () => {
    for (const sample of ['', 'hello', 'café', '€ ☃ 😀', '日本語']) {
      expect(fromUtf8Bytes(toUtf8Bytes(sample))).toBe(sample);
    }
  });

  it('round-trips bytes through a binary string', () => {
    const bytes = toUtf8Bytes('café');
    expect([...binaryStringToBytes(bytesToBinaryString(bytes))]).toEqual([...bytes]);
  });
});

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('leaves other characters untouched', () => {
    expect(escapeHtml('a b c')).toBe('a b c');
  });
});

describe('deburr', () => {
  it('strips diacritics', () => {
    expect(deburr('café déjà vu')).toBe('cafe deja vu');
    expect(deburr('Àéîõü')).toBe('Aeiou');
  });
});

describe('toWords', () => {
  it('splits on separators, camel humps, and digit groups', () => {
    expect(toWords('foo bar')).toEqual(['foo', 'bar']);
    expect(toWords('--foo-bar--')).toEqual(['foo', 'bar']);
    expect(toWords('fooBar')).toEqual(['foo', 'Bar']);
    expect(toWords('__FOO_BAR__')).toEqual(['FOO', 'BAR']);
    expect(toWords('foo2bar')).toEqual(['foo', '2', 'bar']);
    expect(toWords('HTMLParser')).toEqual(['HTML', 'Parser']);
  });

  it('deburrs before splitting so accented letters stay in their word', () => {
    expect(toWords('café')).toEqual(['cafe']);
  });

  it('returns an empty array when there are no words', () => {
    expect(toWords('   ---   ')).toEqual([]);
  });
});
