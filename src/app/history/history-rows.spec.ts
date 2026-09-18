import { describe, expect, it } from 'vitest';
import { AppliedStep } from '../core/state/models';
import { buildDisplayRows, buildHistoryBlocks } from './history-rows';

function step(toolName: string, runId?: string, flowName = 'Flow'): AppliedStep {
  return {
    toolId: toolName.toLowerCase(),
    toolName,
    params: {},
    at: 1,
    group: runId ? { runId, flowId: 'f', flowName } : undefined,
  };
}

describe('buildHistoryBlocks', () => {
  it('keeps ungrouped steps as individual blocks', () => {
    const blocks = buildHistoryBlocks([step('A'), step('B')]);
    expect(blocks).toHaveLength(2);
    expect(blocks.every((b) => b.kind === 'step')).toBe(true);
  });

  it('collapses consecutive steps that share a run id', () => {
    const blocks = buildHistoryBlocks([
      step('A'),
      step('B', 'run-1'),
      step('C', 'run-1'),
      step('D'),
    ]);
    expect(blocks.map((b) => b.kind)).toEqual(['step', 'group', 'step']);
    const group = blocks[1];
    expect(group.kind).toBe('group');
    if (group.kind === 'group') {
      expect(group.startIndex).toBe(2);
      expect(group.endIndex).toBe(3);
      expect(group.steps).toHaveLength(2);
    }
  });

  it('separates two runs even when adjacent', () => {
    const blocks = buildHistoryBlocks([step('A', 'run-1'), step('B', 'run-2')]);
    expect(blocks).toHaveLength(2);
    expect(blocks.every((b) => b.kind === 'group')).toBe(true);
  });
});

describe('buildDisplayRows', () => {
  const steps = [step('A'), step('B', 'run-1'), step('C', 'run-1')];

  it('hides group children when collapsed', () => {
    const rows = buildDisplayRows(steps, new Set(), false);
    expect(rows.map((r) => r.kind)).toEqual(['step', 'group']);
  });

  it('reveals indented children when the group is expanded', () => {
    const rows = buildDisplayRows(steps, new Set(['run-1']), false);
    expect(rows.map((r) => r.kind)).toEqual(['step', 'group', 'step', 'step']);
    const children = rows.filter((r) => r.kind === 'step' && r.child);
    expect(children).toHaveLength(2);
  });

  it('reverses block order and children when descending', () => {
    const rows = buildDisplayRows(steps, new Set(['run-1']), true);
    expect(rows.map((r) => r.kind)).toEqual(['group', 'step', 'step', 'step']);
    const childIndices = rows
      .filter((r) => r.kind === 'step' && r.child)
      .map((r) => (r.kind === 'step' ? r.index : 0));
    expect(childIndices).toEqual([3, 2]);
  });
});
