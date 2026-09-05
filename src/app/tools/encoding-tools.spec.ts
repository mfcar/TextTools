import { describe, expect, it } from 'vitest';
import { ToolParams } from '../core/tools/param-schema';
import { ToolDefinition } from '../core/tools/tool';
import {
  base64Decode,
  base64Encode,
  binaryDecode,
  binaryEncode,
  escapeHtmlTool,
  hexDecode,
  hexEncode,
  urlDecode,
  urlEncode,
  utf8Decode,
  utf8Encode,
} from './encoding-tools';

async function output(
  tool: ToolDefinition,
  input: string,
  params: ToolParams = {},
): Promise<string> {
  const result = await tool.run(input, params);
  if (typeof result === 'string') return result;
  if (result.ok) return result.output;
  throw new Error(`Expected success, got failure: ${result.error}`);
}

async function error(
  tool: ToolDefinition,
  input: string,
  params: ToolParams = {},
): Promise<string> {
  const result = await tool.run(input, params);
  if (typeof result !== 'string' && !result.ok) return result.error;
  throw new Error(`Expected failure, got: ${JSON.stringify(result)}`);
}

const UNICODE_SAMPLES = ['', 'hello world', 'café', '€ ☃ 😀', '日本語'];

describe('Base64', () => {
  it('matches known vectors', async () => {
    expect(await output(base64Encode, 'Man')).toBe('TWFu');
    expect(await output(base64Encode, 'hello')).toBe('aGVsbG8=');
    expect(await output(base64Decode, 'aGVsbG8=')).toBe('hello');
  });

  it('is UTF-8 safe and round-trips', async () => {
    for (const sample of UNICODE_SAMPLES) {
      expect(await output(base64Decode, await output(base64Encode, sample))).toBe(sample);
    }
  });

  it('fails on invalid input instead of crashing', async () => {
    expect(await error(base64Decode, '@@@not base64@@@')).toContain('Base64');
  });
});

describe('Binary', () => {
  it('encodes to space-separated 8-bit groups', async () => {
    expect(await output(binaryEncode, 'A')).toBe('01000001');
    expect(await output(binaryEncode, 'AB')).toBe('01000001 01000010');
  });

  it('round-trips including Unicode', async () => {
    for (const sample of UNICODE_SAMPLES) {
      expect(await output(binaryDecode, await output(binaryEncode, sample))).toBe(sample);
    }
  });

  it('reports non-binary characters', async () => {
    expect(await error(binaryDecode, '01000012')).toContain('0 and 1');
  });

  it('reports a length that is not a multiple of 8', async () => {
    expect(await error(binaryDecode, '0100000')).toContain('multiple of 8');
  });
});

describe('Hexadecimal', () => {
  it('encodes to zero-padded pairs', async () => {
    expect(await output(hexEncode, 'A')).toBe('41');
    expect(await output(hexEncode, 'AB')).toBe('4142');
  });

  it('round-trips including Unicode', async () => {
    for (const sample of UNICODE_SAMPLES) {
      expect(await output(hexDecode, await output(hexEncode, sample))).toBe(sample);
    }
  });

  it('reports non-hex characters', async () => {
    expect(await error(hexDecode, 'zz')).toContain('0-9');
  });

  it('reports an odd number of digits', async () => {
    expect(await error(hexDecode, 'abc')).toContain('even');
  });
});

describe('UTF8', () => {
  it('round-trips through the Latin1 byte representation', async () => {
    for (const sample of UNICODE_SAMPLES) {
      expect(await output(utf8Decode, await output(utf8Encode, sample))).toBe(sample);
    }
  });
});

describe('URL', () => {
  it('encodes and decodes special characters', async () => {
    expect(await output(urlEncode, 'a b&c')).toBe('a%20b%26c');
    expect(await output(urlDecode, 'a%20b%26c')).toBe('a b&c');
  });

  it('fails on malformed percent-encoding', async () => {
    expect(await error(urlDecode, '%')).toContain('URL');
  });
});

describe('Escape', () => {
  it('converts characters to HTML entities', async () => {
    expect(await output(escapeHtmlTool, `<a href="x">Tom & Jerry's</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;',
    );
  });
});
