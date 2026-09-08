import { describe, expect, it } from 'vitest';
import { ToolParams } from '../core/tools/param-schema';
import { ToolDefinition } from '../core/tools/tool';
import {
  csvToJson,
  jsonToCsv,
  jsonToQuery,
  jsonToYaml,
  queryToJson,
  yamlToJson,
} from './conversion-tools';

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

describe('CSV to JSON', () => {
  it('maps the header row to object keys', async () => {
    expect(JSON.parse(await output(csvToJson, 'a,b\n1,2\n3,4'))).toEqual([
      { a: '1', b: '2' },
      { a: '3', b: '4' },
    ]);
  });

  it('handles quoted fields with commas, quotes, and newlines', async () => {
    const csv = 'name,note\n"Doe, John","he said ""hi""\nagain"';
    expect(JSON.parse(await output(csvToJson, csv))).toEqual([
      { name: 'Doe, John', note: 'he said "hi"\nagain' },
    ]);
  });

  it('returns an empty array for empty input', async () => {
    expect(await output(csvToJson, '')).toBe('[]');
  });
});

describe('JSON to CSV', () => {
  it('builds a header from the union of keys', async () => {
    const json = JSON.stringify([
      { a: 1, b: 2 },
      { a: 3, c: 4 },
    ]);
    expect(await output(jsonToCsv, json)).toBe('a,b,c\n1,2,\n3,,4');
  });

  it('quotes fields that need escaping', async () => {
    const json = JSON.stringify([{ v: 'a,b' }, { v: 'he "said"' }]);
    expect(await output(jsonToCsv, json)).toBe('v\n"a,b"\n"he ""said"""');
  });

  it('fails when the top level is not an array', async () => {
    expect(await error(jsonToCsv, '{"a":1}')).toContain('array');
  });
});

describe('Query string to JSON', () => {
  it('parses pairs and collapses repeated keys into arrays', async () => {
    expect(JSON.parse(await output(queryToJson, '?a=1&b=2&a=3'))).toEqual({
      a: ['1', '3'],
      b: '2',
    });
  });
});

describe('JSON to query string', () => {
  it('serializes objects and repeats array keys', async () => {
    expect(await output(jsonToQuery, '{"a":["1","3"],"b":"2"}')).toBe('a=1&a=3&b=2');
  });

  it('fails on a non-object', async () => {
    expect(await error(jsonToQuery, '[1,2]')).toContain('object');
  });
});

describe('YAML and JSON round-trip', () => {
  it('converts YAML to JSON', async () => {
    expect(JSON.parse(await output(yamlToJson, 'name: John\nitems:\n  - 1\n  - 2'))).toEqual({
      name: 'John',
      items: [1, 2],
    });
  });

  it('converts JSON to YAML', async () => {
    const yaml = await output(jsonToYaml, '{"name":"John","items":[1,2]}');
    expect(JSON.parse(await output(yamlToJson, yaml))).toEqual({ name: 'John', items: [1, 2] });
  });

  it('fails on invalid YAML', async () => {
    expect(await error(yamlToJson, '{ unbalanced: [')).toContain('YAML');
  });
});
