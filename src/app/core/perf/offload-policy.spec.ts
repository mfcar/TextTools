import { describe, expect, it } from 'vitest';
import {
  HARD_OFFLOAD_CHARS,
  WORKER_ELIGIBLE_CHARS,
  decideOffload,
  shouldOffload,
} from './offload-policy';

const eligible = { workerEligible: true };
const cheap = { workerEligible: false };

function text(chars: number): string {
  return 'x'.repeat(chars);
}

describe('offload policy', () => {
  it('keeps small inputs on the main thread', () => {
    expect(decideOffload(eligible, text(WORKER_ELIGIBLE_CHARS - 1))).toEqual({
      offload: false,
      reason: 'small-input',
    });
    expect(shouldOffload(cheap, text(1000))).toBe(false);
  });

  it('offloads worker-eligible tools at the eligible threshold', () => {
    expect(decideOffload(eligible, text(WORKER_ELIGIBLE_CHARS))).toEqual({
      offload: true,
      reason: 'worker-eligible',
    });
  });

  it('does not offload non-eligible tools in the mid range', () => {
    const mid = Math.floor((WORKER_ELIGIBLE_CHARS + HARD_OFFLOAD_CHARS) / 2);
    expect(shouldOffload(cheap, text(mid))).toBe(false);
  });

  it('offloads any tool at the hard threshold', () => {
    expect(decideOffload(cheap, text(HARD_OFFLOAD_CHARS))).toEqual({
      offload: true,
      reason: 'hard-threshold',
    });
    expect(shouldOffload(eligible, text(HARD_OFFLOAD_CHARS))).toBe(true);
  });

  it('has a sane threshold ordering', () => {
    expect(WORKER_ELIGIBLE_CHARS).toBeLessThan(HARD_OFFLOAD_CHARS);
  });
});
