import type { ToolDefinition } from '../tools/tool';

export const WORKER_ELIGIBLE_CHARS = 50_000;

export const HARD_OFFLOAD_CHARS = 500_000;

export type OffloadReason = 'small-input' | 'worker-eligible' | 'hard-threshold';

export interface OffloadDecision {
  readonly offload: boolean;
  readonly reason: OffloadReason;
}

export function decideOffload(
  tool: Pick<ToolDefinition, 'workerEligible'>,
  input: string,
): OffloadDecision {
  const size = input.length;
  if (size >= HARD_OFFLOAD_CHARS) {
    return { offload: true, reason: 'hard-threshold' };
  }
  if (tool.workerEligible && size >= WORKER_ELIGIBLE_CHARS) {
    return { offload: true, reason: 'worker-eligible' };
  }
  return { offload: false, reason: 'small-input' };
}

export function shouldOffload(
  tool: Pick<ToolDefinition, 'workerEligible'>,
  input: string,
): boolean {
  return decideOffload(tool, input).offload;
}
