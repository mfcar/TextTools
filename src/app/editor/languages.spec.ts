import { describe, expect, it } from 'vitest';
import { PLAINTEXT, detectLanguage, languageLabel } from './languages';

describe('languageLabel', () => {
  it('returns the label for a known id', () => {
    expect(languageLabel('json')).toBe('JSON');
    expect(languageLabel('typescript')).toBe('TypeScript');
  });

  it('falls back to Plain text for unknown ids', () => {
    expect(languageLabel('unknown')).toBe('Plain text');
    expect(languageLabel(PLAINTEXT)).toBe('Plain text');
  });
});

describe('detectLanguage', () => {
  it('detects from the file extension first', () => {
    expect(detectLanguage('data.json', 'not really json')).toBe('json');
    expect(detectLanguage('script.ts', '')).toBe('typescript');
    expect(detectLanguage('page.html', '')).toBe('html');
    expect(detectLanguage('notes.md', '')).toBe('markdown');
  });

  it('falls back to content when the extension is unknown', () => {
    expect(detectLanguage('file.txt', '{"a": 1}')).toBe('json');
    expect(detectLanguage('noext', '{"a": 1}')).toBe('json');
  });

  it('detects JSON only when it parses', () => {
    expect(detectLanguage('x', '{ not valid }')).toBe(PLAINTEXT);
    expect(detectLanguage('x', '[1, 2, 3]')).toBe('json');
  });

  it('detects YAML front matter', () => {
    expect(detectLanguage('x', '---\nkey: value')).toBe('yaml');
  });

  it('detects XML declarations', () => {
    expect(detectLanguage('x', '<?xml version="1.0"?><root/>')).toBe('xml');
  });

  it('detects HTML tags', () => {
    expect(detectLanguage('x', '<!doctype html><html></html>')).toBe('html');
    expect(detectLanguage('x', '<div>content</div>')).toBe('html');
  });

  it('detects SQL statements', () => {
    expect(detectLanguage('x', 'SELECT * FROM users')).toBe('sql');
  });

  it('detects Markdown patterns', () => {
    expect(detectLanguage('x', '# Heading')).toBe('markdown');
    expect(detectLanguage('x', '- a list item')).toBe('markdown');
  });

  it('returns plaintext for empty or unrecognized content', () => {
    expect(detectLanguage('x', '')).toBe(PLAINTEXT);
    expect(detectLanguage('x', 'just some plain prose.')).toBe(PLAINTEXT);
  });
});
