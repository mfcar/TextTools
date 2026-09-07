/// <reference lib="webworker" />
import { ALL_TOOLS } from '../../tools';
import { executeTool } from './execute-tool';
import { ToolParams } from './param-schema';

interface WorkerRequest {
  readonly id: number;
  readonly toolId: string;
  readonly params: ToolParams;
  readonly buffer: ArrayBuffer;
}

const tools = new Map(ALL_TOOLS.map((tool) => [tool.id, tool]));
const encoder = new TextEncoder();
const decoder = new TextDecoder();

addEventListener('message', async ({ data }: MessageEvent<WorkerRequest>) => {
  const { id, toolId, params, buffer } = data;
  const tool = tools.get(toolId);
  if (!tool) {
    postMessage({ id, ok: false, error: `Unknown tool "${toolId}".` });
    return;
  }

  const input = decoder.decode(new Uint8Array(buffer));
  const result = await executeTool(tool, input, params);
  if (result.ok) {
    const bytes = encoder.encode(result.output);
    postMessage({ id, ok: true, buffer: bytes.buffer }, { transfer: [bytes.buffer] });
  } else {
    postMessage({ id, ok: false, error: result.error });
  }
});
