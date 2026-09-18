import { AppliedStep } from '../core/state/models';

export interface StepDisplayRow {
  readonly kind: 'step';
  readonly index: number;
  readonly toolName: string;
  readonly at: number;
  readonly child: boolean;
}

export interface GroupDisplayRow {
  readonly kind: 'group';
  readonly runId: string;
  readonly flowName: string;
  readonly at: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly count: number;
  readonly expanded: boolean;
}

export type DisplayRow = StepDisplayRow | GroupDisplayRow;

interface StepBlock {
  readonly kind: 'step';
  readonly index: number;
  readonly toolName: string;
  readonly at: number;
}

interface GroupBlock {
  readonly kind: 'group';
  readonly runId: string;
  readonly flowName: string;
  readonly at: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly steps: readonly StepBlock[];
}

type Block = StepBlock | GroupBlock;

/** Collapses consecutive flow-applied steps (shared runId) into groups. */
export function buildHistoryBlocks(steps: readonly AppliedStep[]): readonly Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < steps.length) {
    const runId = steps[i].group?.runId;
    if (!runId) {
      blocks.push({ kind: 'step', index: i + 1, toolName: steps[i].toolName, at: steps[i].at });
      i += 1;
      continue;
    }
    const start = i;
    const groupSteps: StepBlock[] = [];
    while (i < steps.length && steps[i].group?.runId === runId) {
      groupSteps.push({ kind: 'step', index: i + 1, toolName: steps[i].toolName, at: steps[i].at });
      i += 1;
    }
    blocks.push({
      kind: 'group',
      runId,
      flowName: steps[start].group!.flowName,
      at: steps[start].at,
      startIndex: start + 1,
      endIndex: i,
      steps: groupSteps,
    });
  }
  return blocks;
}

/**
 * Flattens grouped history into fixed-height display rows for virtual scroll.
 * Expanded groups emit a header row followed by indented child step rows.
 */
export function buildDisplayRows(
  steps: readonly AppliedStep[],
  expanded: ReadonlySet<string>,
  descending: boolean,
): readonly DisplayRow[] {
  const blocks = buildHistoryBlocks(steps);
  const ordered = descending ? [...blocks].reverse() : blocks;
  const rows: DisplayRow[] = [];
  for (const block of ordered) {
    if (block.kind === 'step') {
      rows.push({
        kind: 'step',
        index: block.index,
        toolName: block.toolName,
        at: block.at,
        child: false,
      });
      continue;
    }
    const isExpanded = expanded.has(block.runId);
    rows.push({
      kind: 'group',
      runId: block.runId,
      flowName: block.flowName,
      at: block.at,
      startIndex: block.startIndex,
      endIndex: block.endIndex,
      count: block.steps.length,
      expanded: isExpanded,
    });
    if (isExpanded) {
      const children = descending ? [...block.steps].reverse() : block.steps;
      for (const child of children) {
        rows.push({
          kind: 'step',
          index: child.index,
          toolName: child.toolName,
          at: child.at,
          child: true,
        });
      }
    }
  }
  return rows;
}
