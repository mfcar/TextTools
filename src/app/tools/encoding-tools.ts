import { defineTool, failure } from '../core/tools/tool';
import {
  binaryStringToBytes,
  bytesToBinaryString,
  escapeHtml,
  fromUtf8Bytes,
  toUtf8Bytes,
} from './helpers';

const CATEGORY = 'Encoding';

export const base64Encode = defineTool({
  id: 'base64-encode',
  name: 'Base64 Encode',
  description: 'Encodes text to a UTF-8-safe Base64 string.',
  category: CATEGORY,
  tags: ['base64', 'encode', 'binary'],
  icon: 'security',
  workerEligible: true,
  params: [],
  run: (input) => btoa(bytesToBinaryString(toUtf8Bytes(input))),
});

export const base64Decode = defineTool({
  id: 'base64-decode',
  name: 'Base64 Decode',
  description: 'Decodes a Base64 string back to UTF-8 text.',
  category: CATEGORY,
  tags: ['base64', 'decode'],
  icon: 'security',
  workerEligible: true,
  params: [],
  run: (input) => {
    try {
      return fromUtf8Bytes(binaryStringToBytes(atob(input)));
    } catch {
      return failure('Invalid Base64 input.');
    }
  },
});

export const binaryEncode = defineTool({
  id: 'binary-encode',
  name: 'Binary Encode',
  description: 'Encodes text as space-separated 8-bit binary (UTF-8 bytes).',
  category: CATEGORY,
  tags: ['binary', 'encode'],
  icon: 'security',
  workerEligible: true,
  params: [],
  run: (input) =>
    [...toUtf8Bytes(input)].map((byte) => byte.toString(2).padStart(8, '0')).join(' '),
});

export const binaryDecode = defineTool({
  id: 'binary-decode',
  name: 'Binary Decode',
  description: 'Decodes 8-bit binary back to UTF-8 text.',
  category: CATEGORY,
  tags: ['binary', 'decode'],
  icon: 'security',
  workerEligible: true,
  params: [],
  run: (input) => {
    const bits = input.replace(/\s+/g, '');
    if (bits.length === 0) {
      return '';
    }
    if (!/^[01]+$/.test(bits)) {
      return failure('Binary input must contain only 0 and 1.');
    }
    if (bits.length % 8 !== 0) {
      return failure('Binary input length must be a multiple of 8 bits.');
    }
    const bytes = new Uint8Array(bits.length / 8);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
    }
    return fromUtf8Bytes(bytes);
  },
});

export const hexEncode = defineTool({
  id: 'hex-encode',
  name: 'Hexadecimal Encode',
  description: 'Encodes text as hexadecimal (UTF-8 bytes).',
  category: CATEGORY,
  tags: ['hex', 'hexadecimal', 'encode'],
  icon: 'security',
  workerEligible: true,
  params: [],
  run: (input) =>
    [...toUtf8Bytes(input)].map((byte) => byte.toString(16).padStart(2, '0')).join(''),
});

export const hexDecode = defineTool({
  id: 'hex-decode',
  name: 'Hexadecimal Decode',
  description: 'Decodes hexadecimal back to UTF-8 text.',
  category: CATEGORY,
  tags: ['hex', 'hexadecimal', 'decode'],
  icon: 'security',
  workerEligible: true,
  params: [],
  run: (input) => {
    const hex = input.replace(/\s+/g, '');
    if (hex.length === 0) {
      return '';
    }
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
      return failure('Hexadecimal input must contain only 0-9 and a-f.');
    }
    if (hex.length % 2 !== 0) {
      return failure('Hexadecimal input must have an even number of digits.');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return fromUtf8Bytes(bytes);
  },
});

export const utf8Encode = defineTool({
  id: 'utf8-encode',
  name: 'UTF8 Encode',
  description: 'Encodes text to a Latin1 string of its UTF-8 bytes.',
  category: CATEGORY,
  tags: ['utf8', 'unicode', 'encode'],
  icon: 'sync_alt',
  params: [],
  run: (input) => bytesToBinaryString(toUtf8Bytes(input)),
});

export const utf8Decode = defineTool({
  id: 'utf8-decode',
  name: 'UTF8 Decode',
  description: 'Decodes a Latin1 string of UTF-8 bytes back to text.',
  category: CATEGORY,
  tags: ['utf8', 'unicode', 'decode'],
  icon: 'sync_alt',
  params: [],
  run: (input) => fromUtf8Bytes(binaryStringToBytes(input)),
});

export const urlEncode = defineTool({
  id: 'url-encode',
  name: 'URL Encode',
  description: 'Percent-encodes special characters for use in a URL.',
  category: CATEGORY,
  tags: ['url', 'uri', 'encode', 'percent'],
  icon: 'insert_link',
  params: [],
  run: (input) => encodeURIComponent(input),
});

export const urlDecode = defineTool({
  id: 'url-decode',
  name: 'URL Decode',
  description: 'Decodes percent-encoded characters in a URL.',
  category: CATEGORY,
  tags: ['url', 'uri', 'decode', 'percent'],
  icon: 'insert_link',
  params: [],
  run: (input) => {
    try {
      return decodeURIComponent(input);
    } catch {
      return failure('Invalid URL-encoded input.');
    }
  },
});

export const escapeHtmlTool = defineTool({
  id: 'escape-html',
  name: 'Escape',
  description: 'Converts characters to their corresponding HTML entities.',
  category: CATEGORY,
  tags: ['html', 'escape', 'entities'],
  icon: 'text_format',
  params: [],
  run: (input) => escapeHtml(input),
});

export const ENCODING_TOOLS = [
  base64Encode,
  base64Decode,
  binaryEncode,
  binaryDecode,
  hexEncode,
  hexDecode,
  utf8Encode,
  utf8Decode,
  urlEncode,
  urlDecode,
  escapeHtmlTool,
] as const;
