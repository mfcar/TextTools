import { ParamSchema, ToolParams } from './param-schema';

export interface ParamValidation {
  readonly params: ToolParams;
  readonly errors: readonly string[];
}

export function validateParams(
  schemas: readonly ParamSchema[],
  raw: Readonly<Record<string, unknown>> = {},
): ParamValidation {
  const params: ToolParams = {};
  const errors: string[] = [];

  for (const schema of schemas) {
    const provided = raw[schema.key];
    const value = provided === undefined || provided === null ? schema.default : provided;

    switch (schema.type) {
      case 'text': {
        const text = String(value);
        if (schema.minLength !== undefined && text.length < schema.minLength) {
          errors.push(`"${schema.label}" must be at least ${schema.minLength} characters.`);
        }
        if (schema.maxLength !== undefined && text.length > schema.maxLength) {
          errors.push(`"${schema.label}" must be at most ${schema.maxLength} characters.`);
        }
        if (schema.pattern !== undefined && !new RegExp(`^(?:${schema.pattern})$`).test(text)) {
          errors.push(`"${schema.label}" has an invalid format.`);
        }
        params[schema.key] = text;
        break;
      }
      case 'number': {
        const num = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(num)) {
          errors.push(`"${schema.label}" must be a number.`);
          params[schema.key] = schema.default;
          break;
        }
        if (schema.integer && !Number.isInteger(num)) {
          errors.push(`"${schema.label}" must be a whole number.`);
        }
        if (schema.min !== undefined && num < schema.min) {
          errors.push(`"${schema.label}" must be ≥ ${schema.min}.`);
        }
        if (schema.max !== undefined && num > schema.max) {
          errors.push(`"${schema.label}" must be ≤ ${schema.max}.`);
        }
        params[schema.key] = num;
        break;
      }
      case 'boolean': {
        params[schema.key] = typeof value === 'boolean' ? value : value === 'true' || value === 1;
        break;
      }
      case 'select': {
        const option = String(value);
        if (schema.options.some((candidate) => candidate.value === option)) {
          params[schema.key] = option;
        } else {
          errors.push(`"${schema.label}" must be one of the available options.`);
          params[schema.key] = schema.default;
        }
        break;
      }
    }
  }

  return { params, errors };
}
