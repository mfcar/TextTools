import { describe, expect, it } from 'vitest';
import { ToolParams } from '../core/tools/param-schema';
import { ToolDefinition } from '../core/tools/tool';
import { hmacSha256, jwtDecode, md5, sha1, sha256, sha384, sha512 } from './crypto-tools';

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

describe('MD5', () => {
  it('matches known vectors', async () => {
    expect(await output(md5, '')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(await output(md5, 'abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(await output(md5, 'The quick brown fox jumps over the lazy dog')).toBe(
      '9e107d9d372bb6826bd81d3542a419d6',
    );
  });

  it('hashes multi-block and Unicode input', async () => {
    expect(await output(md5, 'a'.repeat(1000))).toBe('cabe45dcc9ae5b66ba86600cca6b8ba8');
    expect(await output(md5, 'café')).toBe('07117fe4a1ebd544965dc19573183da2');
  });
});

describe('SHA family', () => {
  it('matches known SHA-256 and SHA-1 vectors', async () => {
    expect(await output(sha256, 'abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(await output(sha1, 'abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  it('computes SHA-384 and SHA-512 as hex', async () => {
    expect(await output(sha384, 'abc')).toHaveLength(96);
    expect(await output(sha512, 'abc')).toHaveLength(128);
    expect(await output(sha512, 'abc')).toMatch(/^[0-9a-f]+$/);
  });
});

describe('HMAC-SHA256', () => {
  it('matches a known vector', async () => {
    expect(
      await output(hmacSha256, 'The quick brown fox jumps over the lazy dog', { secret: 'key' }),
    ).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
  });
});

describe('JWT decode', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
    '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  it('decodes the header and payload', async () => {
    const decoded = JSON.parse(await output(jwtDecode, token));
    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(decoded.payload.name).toBe('John Doe');
  });

  it('surfaces timestamps in a readable form', async () => {
    const decoded = JSON.parse(await output(jwtDecode, token));
    expect(decoded.timestamps.iat).toBe('2018-01-18T01:30:22.000Z');
  });

  it('fails on a token with too few segments', async () => {
    expect(await error(jwtDecode, 'not-a-token')).toContain('at least two');
  });

  it('fails on non-Base64URL JSON segments', async () => {
    expect(await error(jwtDecode, 'aaaa.bbbb.cccc')).toContain('decode');
  });
});
