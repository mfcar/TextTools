import { defineTool, failure } from '../core/tools/tool';

const CATEGORY = 'Conversion';

function jsonError(error: unknown): string {
  return `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (char === '\r') {
      i += 1;
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function escapeCsvField(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);
  return /["\n\r,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const csvToJson = defineTool({
  id: 'csv-to-json',
  name: 'CSV to JSON',
  description: 'Converts CSV with a header row to a JSON array of objects.',
  category: CATEGORY,
  tags: ['csv', 'json', 'convert', 'data'],
  icon: 'table_chart',
  workerEligible: true,
  params: [],
  run: (input) => {
    if (input.trim() === '') {
      return '[]';
    }
    const rows = parseCsv(input);
    const [header, ...body] = rows;
    const objects = body.map((cells) => {
      const object: Record<string, string> = {};
      header.forEach((key, index) => {
        object[key] = cells[index] ?? '';
      });
      return object;
    });
    return JSON.stringify(objects, null, 2);
  },
});

export const jsonToCsv = defineTool({
  id: 'json-to-csv',
  name: 'JSON to CSV',
  description: 'Converts a JSON array of objects to CSV with a header row.',
  category: CATEGORY,
  tags: ['json', 'csv', 'convert', 'data'],
  icon: 'table_chart',
  workerEligible: true,
  params: [],
  run: (input) => {
    let data: unknown;
    try {
      data = JSON.parse(input);
    } catch (error) {
      return failure(jsonError(error));
    }
    if (!Array.isArray(data)) {
      return failure('Expected a JSON array of objects.');
    }
    if (data.length === 0) {
      return '';
    }
    const keys: string[] = [];
    for (const item of data) {
      if (item === null || typeof item !== 'object' || Array.isArray(item)) {
        return failure('Every array item must be an object.');
      }
      for (const key of Object.keys(item)) {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      }
    }
    const lines = [keys.map(escapeCsvField).join(',')];
    for (const item of data as Record<string, unknown>[]) {
      lines.push(keys.map((key) => escapeCsvField(item[key])).join(','));
    }
    return lines.join('\n');
  },
});

export const queryToJson = defineTool({
  id: 'query-to-json',
  name: 'Query String to JSON',
  description: 'Parses a URL query string into a JSON object. Repeated keys become arrays.',
  category: CATEGORY,
  tags: ['query', 'querystring', 'url', 'json', 'convert'],
  icon: 'link',
  params: [],
  run: (input) => {
    const params = new URLSearchParams(input.trim().replace(/^\?/, ''));
    const object: Record<string, string | string[]> = {};
    for (const key of new Set(params.keys())) {
      const values = params.getAll(key);
      object[key] = values.length > 1 ? values : values[0];
    }
    return JSON.stringify(object, null, 2);
  },
});

export const jsonToQuery = defineTool({
  id: 'json-to-query',
  name: 'JSON to Query String',
  description: 'Serializes a flat JSON object to a URL query string. Arrays repeat the key.',
  category: CATEGORY,
  tags: ['json', 'query', 'querystring', 'url', 'convert'],
  icon: 'link',
  params: [],
  run: (input) => {
    let data: unknown;
    try {
      data = JSON.parse(input);
    } catch (error) {
      return failure(jsonError(error));
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return failure('Expected a JSON object.');
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          params.append(key, item === null ? '' : String(item));
        }
      } else {
        params.append(
          key,
          value === null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value),
        );
      }
    }
    return params.toString();
  },
});

export const yamlToJson = defineTool({
  id: 'yaml-to-json',
  name: 'YAML to JSON',
  description: 'Converts a YAML document to formatted JSON.',
  category: CATEGORY,
  tags: ['yaml', 'json', 'convert', 'data'],
  icon: 'data_object',
  params: [],
  run: async (input) => {
    try {
      const { parse } = await import('yaml');
      return JSON.stringify(parse(input) ?? null, null, 2);
    } catch (error) {
      return failure(`Invalid YAML: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

export const jsonToYaml = defineTool({
  id: 'json-to-yaml',
  name: 'JSON to YAML',
  description: 'Converts a JSON document to YAML.',
  category: CATEGORY,
  tags: ['json', 'yaml', 'convert', 'data'],
  icon: 'data_object',
  params: [],
  run: async (input) => {
    let data: unknown;
    try {
      data = JSON.parse(input);
    } catch (error) {
      return failure(jsonError(error));
    }
    const { stringify } = await import('yaml');
    return stringify(data);
  },
});

export const CONVERSION_TOOLS = [
  csvToJson,
  jsonToCsv,
  queryToJson,
  jsonToQuery,
  yamlToJson,
  jsonToYaml,
] as const;
