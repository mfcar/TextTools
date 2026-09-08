import { CASE_TOOLS } from './case-tools';
import { CONVERSION_TOOLS } from './conversion-tools';
import { CRYPTO_TOOLS } from './crypto-tools';
import { ENCODING_TOOLS } from './encoding-tools';
import { FORMAT_TOOLS } from './format-tools';
import { TEXT_TOOLS } from './text-tools';
import { TEXT_UTILITY_TOOLS } from './text-utility-tools';

export * from './encoding-tools';
export * from './case-tools';
export * from './text-tools';
export * from './crypto-tools';
export * from './format-tools';
export * from './conversion-tools';
export * from './text-utility-tools';

/** Every built-in tool, in catalog order. Register with `provideTools`. */
export const ALL_TOOLS = [
  ...ENCODING_TOOLS,
  ...CASE_TOOLS,
  ...TEXT_TOOLS,
  ...CRYPTO_TOOLS,
  ...FORMAT_TOOLS,
  ...CONVERSION_TOOLS,
  ...TEXT_UTILITY_TOOLS,
];
