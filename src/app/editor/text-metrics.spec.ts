import { describe, expect, it } from 'vitest';
import { countGraphemes, countLines } from './text-metrics';

describe('countGraphemes', () => {
  it('counts an empty string as zero', () => {
    expect(countGraphemes('')).toBe(0);
  });

  it('counts plain ASCII', () => {
    expect(countGraphemes('hello')).toBe(5);
  });

  it('counts an astral character (emoji) as one', () => {
    expect(countGraphemes('😀')).toBe(1);
  });

  it('counts a ZWJ emoji sequence as a single grapheme', () => {
    // Family emoji: multiple code points joined by ZWJ.
    expect(countGraphemes('👨‍👩‍👧')).toBe(1);
  });

  it('counts a combining sequence as one grapheme', () => {
    // "e" + combining acute accent.
    expect(countGraphemes('é')).toBe(1);
  });
});

describe('countLines', () => {
  it('counts an empty string as zero lines', () => {
    expect(countLines('')).toBe(0);
  });

  it('counts a single line', () => {
    expect(countLines('one line')).toBe(1);
  });

  it('counts newline-separated lines', () => {
    expect(countLines('a\nb\nc')).toBe(3);
  });

  it('counts a trailing newline as an extra line', () => {
    expect(countLines('a\n')).toBe(2);
  });
});
