import { describe, expect, it } from 'vitest';
import { ParamSchema } from './param-schema';
import { validateParams } from './validate-params';

describe('validateParams', () => {
  it('applies defaults for missing values', () => {
    const schemas: readonly ParamSchema[] = [
      { type: 'text', key: 'sep', label: 'Separator', default: ',' },
      { type: 'number', key: 'count', label: 'Count', default: 1 },
      { type: 'boolean', key: 'trim', label: 'Trim', default: true },
    ];

    const { params, errors } = validateParams(schemas);

    expect(errors).toEqual([]);
    expect(params).toEqual({ sep: ',', count: 1, trim: true });
  });

  it('treats null the same as missing', () => {
    const schemas: readonly ParamSchema[] = [
      { type: 'text', key: 'sep', label: 'Separator', default: '-' },
    ];

    const { params } = validateParams(schemas, { sep: null });

    expect(params['sep']).toBe('-');
  });

  describe('text', () => {
    it('enforces min and max length', () => {
      const schemas: readonly ParamSchema[] = [
        { type: 'text', key: 'v', label: 'Value', default: '', minLength: 2, maxLength: 4 },
      ];

      expect(validateParams(schemas, { v: 'a' }).errors).toHaveLength(1);
      expect(validateParams(schemas, { v: 'abcde' }).errors).toHaveLength(1);
      expect(validateParams(schemas, { v: 'abc' }).errors).toEqual([]);
    });

    it('validates the whole value against the pattern', () => {
      const schemas: readonly ParamSchema[] = [
        { type: 'text', key: 'v', label: 'Value', default: '', pattern: '\\d+' },
      ];

      expect(validateParams(schemas, { v: '123' }).errors).toEqual([]);
      expect(validateParams(schemas, { v: '12a' }).errors).toHaveLength(1);
    });

    it('coerces non-string input to a string', () => {
      const schemas: readonly ParamSchema[] = [
        { type: 'text', key: 'v', label: 'Value', default: '' },
      ];

      expect(validateParams(schemas, { v: 42 }).params['v']).toBe('42');
    });
  });

  describe('number', () => {
    it('coerces numeric strings', () => {
      const schemas: readonly ParamSchema[] = [
        { type: 'number', key: 'n', label: 'N', default: 0 },
      ];

      expect(validateParams(schemas, { n: '7' }).params['n']).toBe(7);
    });

    it('reports non-numeric input and falls back to the default', () => {
      const schemas: readonly ParamSchema[] = [
        { type: 'number', key: 'n', label: 'N', default: 5 },
      ];

      const { params, errors } = validateParams(schemas, { n: 'abc' });

      expect(errors).toHaveLength(1);
      expect(params['n']).toBe(5);
    });

    it('enforces integer, min, and max', () => {
      const schemas: readonly ParamSchema[] = [
        { type: 'number', key: 'n', label: 'N', default: 1, integer: true, min: 1, max: 10 },
      ];

      expect(validateParams(schemas, { n: 2.5 }).errors).toHaveLength(1);
      expect(validateParams(schemas, { n: 0 }).errors).toHaveLength(1);
      expect(validateParams(schemas, { n: 11 }).errors).toHaveLength(1);
      expect(validateParams(schemas, { n: 5 }).errors).toEqual([]);
    });
  });

  describe('boolean', () => {
    it('coerces "true" and 1 to true', () => {
      const schemas: readonly ParamSchema[] = [
        { type: 'boolean', key: 'b', label: 'B', default: false },
      ];

      expect(validateParams(schemas, { b: 'true' }).params['b']).toBe(true);
      expect(validateParams(schemas, { b: 1 }).params['b']).toBe(true);
      expect(validateParams(schemas, { b: 'false' }).params['b']).toBe(false);
      expect(validateParams(schemas, { b: 0 }).params['b']).toBe(false);
    });
  });

  describe('select', () => {
    const schemas: readonly ParamSchema[] = [
      {
        type: 'select',
        key: 'mode',
        label: 'Mode',
        default: 'a',
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
    ];

    it('accepts a valid option', () => {
      expect(validateParams(schemas, { mode: 'b' }).params['mode']).toBe('b');
    });

    it('rejects an unknown option and falls back to the default', () => {
      const { params, errors } = validateParams(schemas, { mode: 'z' });

      expect(errors).toHaveLength(1);
      expect(params['mode']).toBe('a');
    });
  });
});
