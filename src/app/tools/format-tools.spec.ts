import { describe, expect, it } from 'vitest';
import { ToolParams } from '../core/tools/param-schema';
import { ToolDefinition } from '../core/tools/tool';
import {
  formatCssTool,
  formatJson,
  formatSqlTool,
  formatXmlTool,
  minifyCss,
  minifyXml,
} from './format-tools';

function output(tool: ToolDefinition, input: string, params: ToolParams = {}): string {
  const result = tool.run(input, params);
  if (typeof result === 'string') return result;
  if ('ok' in result && result.ok) return result.output;
  throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
}

describe('Format JSON', () => {
  it('pretty-prints with the requested indent', () => {
    expect(output(formatJson, '{"a":1,"b":[1,2]}', { indent: 2 })).toBe(
      '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}',
    );
  });

  it('fails on invalid JSON', () => {
    const result = formatJson.run('{bad}', { indent: 2 });
    expect(typeof result === 'string' ? null : result).toMatchObject({ ok: false });
  });
});

describe('Format XML', () => {
  it('indents nested elements', () => {
    expect(output(formatXmlTool, '<a><b>text</b></a>')).toBe('<a>\n  <b>text</b>\n</a>');
  });

  it('leaves self-closing tags at their level', () => {
    expect(output(formatXmlTool, '<root><br/><br/></root>')).toBe(
      '<root>\n  <br/>\n  <br/>\n</root>',
    );
  });

  it('returns empty for empty input', () => {
    expect(output(formatXmlTool, '   ')).toBe('');
  });
});

describe('Minify XML', () => {
  it('removes whitespace between tags', () => {
    expect(output(minifyXml, '<a>\n  <b>1</b>\n</a>')).toBe('<a><b>1</b></a>');
  });
});

describe('Format CSS', () => {
  it('puts one declaration per line and indents the block', () => {
    expect(output(formatCssTool, 'a{color:red;margin:0}')).toBe('a {\n  color:red;\n  margin:0\n}');
  });
});

describe('Minify CSS', () => {
  it('strips comments and collapses whitespace', () => {
    expect(output(minifyCss, 'a {\n  color: red; /* note */\n  margin: 0;\n}')).toBe(
      'a{color:red;margin:0}',
    );
  });
});

describe('Format SQL', () => {
  it('uppercases keywords and breaks major clauses onto new lines', () => {
    expect(output(formatSqlTool, 'select a, b from t where a = 1 and b = 2')).toBe(
      'SELECT a, b\nFROM t\nWHERE a = 1\n  AND b = 2',
    );
  });
});
