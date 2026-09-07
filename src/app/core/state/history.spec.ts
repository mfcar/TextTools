import { describe, expect, it } from 'vitest';
import { failure, success } from '../tools/tool';
import type { AppliedStep, Checkpoint } from './models';
import {
  StepRunner,
  isCheckpointIndex,
  pruneCheckpoints,
  replayTo,
  selectReplayStart,
} from './history';

function step(toolId: string): AppliedStep {
  return { toolId, toolName: toolId, params: {}, at: 0 };
}

describe('isCheckpointIndex', () => {
  it('is false at the base (0) and true at multiples of the interval', () => {
    expect(isCheckpointIndex(0, 10)).toBe(false);
    expect(isCheckpointIndex(9, 10)).toBe(false);
    expect(isCheckpointIndex(10, 10)).toBe(true);
    expect(isCheckpointIndex(20, 10)).toBe(true);
    expect(isCheckpointIndex(25, 10)).toBe(false);
  });
});

describe('selectReplayStart', () => {
  const base = 'BASE';
  const checkpoints: readonly Checkpoint[] = [
    { index: 2, content: 'AB' },
    { index: 4, content: 'ABCD' },
  ];

  it('falls back to the base when no checkpoint is at or below the target', () => {
    expect(selectReplayStart(base, checkpoints, 1)).toEqual({ index: 0, content: 'BASE' });
  });

  it('picks the highest checkpoint at or below the target', () => {
    expect(selectReplayStart(base, checkpoints, 3)).toEqual({ index: 2, content: 'AB' });
    expect(selectReplayStart(base, checkpoints, 4)).toEqual({ index: 4, content: 'ABCD' });
    expect(selectReplayStart(base, checkpoints, 9)).toEqual({ index: 4, content: 'ABCD' });
  });
});

describe('pruneCheckpoints', () => {
  const checkpoints: readonly Checkpoint[] = [
    { index: 2, content: '0123456789' }, // 20 bytes
    { index: 4, content: '0123456789' }, // 20 bytes
    { index: 6, content: '0123456789' }, // 20 bytes
  ];

  it('keeps every checkpoint when within budget', () => {
    expect(pruneCheckpoints(checkpoints, 1000)).toHaveLength(3);
  });

  it('drops the oldest checkpoints first when over budget', () => {
    const kept = pruneCheckpoints(checkpoints, 40);
    expect(kept.map((cp) => cp.index)).toEqual([4, 6]);
  });

  it('can drop all checkpoints (base is always a valid replay start)', () => {
    expect(pruneCheckpoints(checkpoints, 0)).toEqual([]);
  });

  it('sorts by index regardless of input order', () => {
    const shuffled: readonly Checkpoint[] = [
      { index: 6, content: 'a' },
      { index: 2, content: 'a' },
      { index: 4, content: 'a' },
    ];
    expect(pruneCheckpoints(shuffled, 1000).map((cp) => cp.index)).toEqual([2, 4, 6]);
  });
});

describe('replayTo', () => {
  // A deterministic runner that appends the step's toolId to the input.
  const appendRunner: StepRunner = (s, input) => Promise.resolve(success(input + s.toolId));
  const history = [step('a'), step('b'), step('c')];

  it('replays from the base to the target index', async () => {
    expect(await replayTo(appendRunner, '', [], history, 3)).toBe('abc');
    expect(await replayTo(appendRunner, '', [], history, 0)).toBe('');
  });

  it('starts from the nearest checkpoint instead of the base', async () => {
    const checkpoints: readonly Checkpoint[] = [{ index: 2, content: 'AB' }];
    expect(await replayTo(appendRunner, '', checkpoints, history, 3)).toBe('ABc');
  });

  it('throws when a replayed step fails', async () => {
    const failing: StepRunner = () => Promise.resolve(failure('boom'));
    await expect(replayTo(failing, '', [], history, 1)).rejects.toThrow(/Replay failed at step 0/);
  });
});
