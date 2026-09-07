import { ParamSchema, ParamsFromSchema, ToolParams } from './param-schema';

export type ToolCategory = string;

export type ToolResult =
  { readonly ok: true; readonly output: string } | { readonly ok: false; readonly error: string };

export function success(output: string): ToolResult {
  return { ok: true, output };
}

export function failure(error: string): ToolResult {
  return { ok: false, error };
}

export type ToolRunReturn = string | ToolResult | Promise<string | ToolResult>;

export interface ToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly tags: readonly string[];
  readonly icon: string;
  readonly params: readonly ParamSchema[];
  readonly workerEligible: boolean;
  run(input: string, params: ToolParams): ToolRunReturn;
}

interface ToolDefinitionInput<P extends readonly ParamSchema[]> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly tags?: readonly string[];
  readonly icon: string;
  readonly params: P;
  readonly workerEligible?: boolean;
  run(input: string, params: ParamsFromSchema<P>): ToolRunReturn;
}

export function defineTool<const P extends readonly ParamSchema[]>(
  definition: ToolDefinitionInput<P>,
): ToolDefinition {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    tags: definition.tags ?? [],
    icon: definition.icon,
    params: definition.params,
    workerEligible: definition.workerEligible ?? false,
    run: definition.run,
  };
}
