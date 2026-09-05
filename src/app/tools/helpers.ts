const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function toUtf8Bytes(text: string): Uint8Array {
  return textEncoder.encode(text);
}

export function fromUtf8Bytes(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

/** Represents bytes as a Latin1 (binary) string — one char per byte. */
export function bytesToBinaryString(bytes: Uint8Array): string {
  let result = '';
  for (const byte of bytes) {
    result += String.fromCharCode(byte);
  }
  return result;
}

/** Reads a Latin1 (binary) string back into bytes, keeping the low 8 bits. */
export function binaryStringToBytes(binary: string): Uint8Array {
  return Uint8Array.from(binary, (char) => char.charCodeAt(0) & 0xff);
}

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export function deburr(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const WORD_PATTERN = /[A-Z]{2,}(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|[A-Z]+|[0-9]+/g;

export function toWords(text: string): string[] {
  return deburr(text).match(WORD_PATTERN) ?? [];
}
