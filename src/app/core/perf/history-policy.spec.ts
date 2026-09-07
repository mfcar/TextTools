import { describe, expect, it } from 'vitest';
import {
  CHECKPOINT_BUDGET_BYTES,
  CHECKPOINT_INTERVAL,
  DEFAULT_HISTORY_CONFIG,
  HISTORY_CAP,
} from './history-policy';

describe('history policy constants', () => {
  it('exposes the calibrated Phase 4.5 numbers', () => {
    expect(CHECKPOINT_INTERVAL).toBe(10);
    expect(HISTORY_CAP).toBe(500);
    expect(CHECKPOINT_BUDGET_BYTES).toBe(32 * 1024 * 1024);
  });

  it('defaults the config to those constants', () => {
    expect(DEFAULT_HISTORY_CONFIG).toEqual({
      checkpointInterval: CHECKPOINT_INTERVAL,
      historyCap: HISTORY_CAP,
      checkpointBudgetBytes: CHECKPOINT_BUDGET_BYTES,
    });
  });
});
