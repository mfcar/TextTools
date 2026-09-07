import { CASE_TOOLS } from './case-tools';
import { ENCODING_TOOLS } from './encoding-tools';
import { TEXT_TOOLS } from './text-tools';

export * from './encoding-tools';
export * from './case-tools';
export * from './text-tools';

/** Every built-in tool, in catalog order. Register with `provideTools`. */
export const ALL_TOOLS = [...ENCODING_TOOLS, ...CASE_TOOLS, ...TEXT_TOOLS];
