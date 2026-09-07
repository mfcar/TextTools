import { ToolParams } from './param-schema';
import { ToolDefinition, ToolResult, failure, success } from './tool';
import { validateParams } from './validate-params';

export async function executeTool(
  tool: ToolDefinition,
  input: string,
  rawParams: Readonly<Record<string, unknown>> = {},
): Promise<ToolResult> {
  const { params, errors } = validateParams(tool.params, rawParams);
  if (errors.length > 0) {
    return failure(errors.join(' '));
  }

  try {
    const result = await tool.run(input, params as ToolParams);
    return typeof result === 'string' ? success(result) : result;
  } catch (error) {
    return failure(error instanceof Error ? error.message : String(error));
  }
}
