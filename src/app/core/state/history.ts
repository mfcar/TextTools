import type { ToolResult } from '../tools/tool';
import type { AppliedStep, Checkpoint } from './models';

export function isCheckpointIndex(index: number, interval: number): boolean {
  return index > 0 && index % interval === 0;
}

export function selectReplayStart(
  baseContent: string,
  checkpoints: readonly Checkpoint[],
  targetIndex: number,
): { readonly index: number; readonly content: string } {
  let best = { index: 0, content: baseContent };
  for (const cp of checkpoints) {
    if (cp.index <= targetIndex && cp.index > best.index) {
      best = { index: cp.index, content: cp.content };
    }
  }
  return best;
}

export function pruneCheckpoints(
  checkpoints: readonly Checkpoint[],
  budgetBytes: number,
): readonly Checkpoint[] {
  const sorted = [...checkpoints].sort((a, b) => a.index - b.index);
  let total = sorted.reduce((sum, cp) => sum + cp.content.length * 2, 0);
  let start = 0;
  while (start < sorted.length && total > budgetBytes) {
    total -= sorted[start].content.length * 2;
    start += 1;
  }
  return sorted.slice(start);
}

export type StepRunner = (step: AppliedStep, input: string) => Promise<ToolResult>;

export async function replayTo(
  run: StepRunner,
  baseContent: string,
  checkpoints: readonly Checkpoint[],
  history: readonly AppliedStep[],
  targetIndex: number,
): Promise<string> {
  const start = selectReplayStart(baseContent, checkpoints, targetIndex);
  let content = start.content;
  for (let i = start.index; i < targetIndex; i += 1) {
    const step = history[i];
    const result = await run(step, content);
    if (!result.ok) {
      throw new Error(`Replay failed at step ${i} ("${step.toolId}"): ${result.error}`);
    }
    content = result.output;
  }
  return content;
}
