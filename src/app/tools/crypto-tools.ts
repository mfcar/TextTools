import { defineTool, failure } from '../core/tools/tool';
import { binaryStringToBytes, fromUtf8Bytes, toUtf8Bytes } from './helpers';

const CATEGORY = 'Crypto';

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}

async function digestHex(
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  input: string,
): Promise<string> {
  const buffer = await crypto.subtle.digest(algorithm, encoder.encode(input));
  return toHex(new Uint8Array(buffer));
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.length % 4 === 0 ? base64 : base64 + '='.repeat(4 - (base64.length % 4));
  return fromUtf8Bytes(binaryStringToBytes(atob(padded)));
}

function rotateLeft(value: number, shift: number): number {
  return (value << shift) | (value >>> (32 - shift));
}

const MD5_SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
  20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6,
  10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const MD5_CONSTANTS = (() => {
  const table = new Int32Array(64);
  for (let i = 0; i < 64; i++) {
    table[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
  }
  return table;
})();

function md5Hex(input: string): string {
  const bytes = toUtf8Bytes(input);
  const bitLength = bytes.length * 8;
  const withPadding = bytes.length + 1;
  const totalLength = withPadding + ((56 - (withPadding % 64) + 64) % 64) + 8;
  const message = new Uint8Array(totalLength);
  message.set(bytes);
  message[bytes.length] = 0x80;
  const view = new DataView(message.buffer);
  view.setUint32(totalLength - 8, bitLength >>> 0, true);
  view.setUint32(totalLength - 4, Math.floor(bitLength / 0x100000000) >>> 0, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < totalLength; offset += 64) {
    const words = new Int32Array(16);
    for (let i = 0; i < 16; i++) {
      words[i] = view.getUint32(offset + i * 4, true) | 0;
    }
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      f = (f + a + MD5_CONSTANTS[i] + words[g]) | 0;
      a = d;
      d = c;
      c = b;
      b = (b + rotateLeft(f, MD5_SHIFTS[i])) | 0;
    }
    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  const digest = new Uint8Array(16);
  const output = new DataView(digest.buffer);
  output.setInt32(0, a0, true);
  output.setInt32(4, b0, true);
  output.setInt32(8, c0, true);
  output.setInt32(12, d0, true);
  return toHex(digest);
}

export const jwtDecode = defineTool({
  id: 'jwt-decode',
  name: 'JWT Decode',
  description: 'Decodes a JWT header and payload. Does not verify the signature.',
  category: CATEGORY,
  tags: ['jwt', 'token', 'decode', 'auth'],
  icon: 'key',
  params: [],
  run: (input) => {
    const segments = input.trim().split('.');
    if (segments.length < 2) {
      return failure('Not a valid JWT: expected at least two dot-separated segments.');
    }
    try {
      const header = JSON.parse(base64UrlDecode(segments[0]));
      const payload = JSON.parse(base64UrlDecode(segments[1]));
      const decoded: Record<string, unknown> = { header, payload };
      if (payload && typeof payload === 'object') {
        const timestamps: Record<string, string> = {};
        for (const claim of ['iat', 'nbf', 'exp'] as const) {
          const value = (payload as Record<string, unknown>)[claim];
          if (typeof value === 'number') {
            timestamps[claim] = new Date(value * 1000).toISOString();
          }
        }
        if (Object.keys(timestamps).length > 0) {
          decoded['timestamps'] = timestamps;
        }
      }
      return JSON.stringify(decoded, null, 2);
    } catch {
      return failure('Could not decode the JWT: its segments are not valid Base64URL JSON.');
    }
  },
});

export const md5 = defineTool({
  id: 'md5',
  name: 'MD5 Hash',
  description:
    'Computes the MD5 hash as hex. MD5 is not collision-resistant; avoid it for security.',
  category: CATEGORY,
  tags: ['md5', 'hash', 'checksum'],
  icon: 'tag',
  workerEligible: true,
  params: [],
  run: (input) => md5Hex(input),
});

export const sha1 = defineTool({
  id: 'sha1',
  name: 'SHA-1 Hash',
  description: 'Computes the SHA-1 hash as hex. SHA-1 is weak; avoid it for new security uses.',
  category: CATEGORY,
  tags: ['sha1', 'sha-1', 'hash', 'checksum'],
  icon: 'tag',
  workerEligible: true,
  params: [],
  run: (input) => digestHex('SHA-1', input),
});

export const sha256 = defineTool({
  id: 'sha256',
  name: 'SHA-256 Hash',
  description: 'Computes the SHA-256 hash as hex.',
  category: CATEGORY,
  tags: ['sha256', 'sha-256', 'hash', 'checksum'],
  icon: 'tag',
  workerEligible: true,
  params: [],
  run: (input) => digestHex('SHA-256', input),
});

export const sha384 = defineTool({
  id: 'sha384',
  name: 'SHA-384 Hash',
  description: 'Computes the SHA-384 hash as hex.',
  category: CATEGORY,
  tags: ['sha384', 'sha-384', 'hash', 'checksum'],
  icon: 'tag',
  workerEligible: true,
  params: [],
  run: (input) => digestHex('SHA-384', input),
});

export const sha512 = defineTool({
  id: 'sha512',
  name: 'SHA-512 Hash',
  description: 'Computes the SHA-512 hash as hex.',
  category: CATEGORY,
  tags: ['sha512', 'sha-512', 'hash', 'checksum'],
  icon: 'tag',
  workerEligible: true,
  params: [],
  run: (input) => digestHex('SHA-512', input),
});

export const hmacSha256 = defineTool({
  id: 'hmac-sha256',
  name: 'HMAC-SHA256',
  description: 'Computes an HMAC-SHA256 of the text using a secret key, as hex.',
  category: CATEGORY,
  tags: ['hmac', 'sha256', 'signature', 'mac'],
  icon: 'key',
  workerEligible: true,
  params: [{ type: 'text', key: 'secret', label: 'Secret key', default: '' }],
  run: async (input, params) => {
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(params.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(input));
    return toHex(new Uint8Array(signature));
  },
});

export const CRYPTO_TOOLS = [jwtDecode, md5, sha1, sha256, sha384, sha512, hmacSha256] as const;
