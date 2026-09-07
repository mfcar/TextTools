export type ParamType = 'text' | 'number' | 'boolean' | 'select';

export type ParamValue = string | number | boolean;

export type ToolParams = Record<string, ParamValue>;

interface BaseParamSchema<TType extends ParamType, TValue extends ParamValue> {
  readonly type: TType;
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  readonly default: TValue;
}

export interface TextParamSchema extends BaseParamSchema<'text', string> {
  readonly placeholder?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly multiline?: boolean;
}

export interface NumberParamSchema extends BaseParamSchema<'number', number> {
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly integer?: boolean;
}

export type BooleanParamSchema = BaseParamSchema<'boolean', boolean>;

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectParamSchema extends BaseParamSchema<'select', string> {
  readonly options: readonly SelectOption[];
}

export type ParamSchema =
  TextParamSchema | NumberParamSchema | BooleanParamSchema | SelectParamSchema;

type ParamValueOf<S extends ParamSchema> = S['type'] extends 'number'
  ? number
  : S['type'] extends 'boolean'
    ? boolean
    : string;

export type ParamsFromSchema<P extends readonly ParamSchema[]> = {
  readonly [S in P[number] as S['key']]: ParamValueOf<S>;
};
