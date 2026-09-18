import { describe, expect, it } from 'vitest';
import { describeStep, latestVersion, serializeSteps, toFlowStep, toFlowSteps } from './flow';
import { AppliedStep, Flow } from './models';

describe('flow helpers', () => {
  it('clones params when converting an applied step', () => {
    const params = { s: '!' };
    const applied: AppliedStep = { toolId: 'append', toolName: 'Append', params, at: 5 };
    const step = toFlowStep(applied);
    expect(step).toEqual({ toolId: 'append', toolName: 'Append', params: { s: '!' } });
    expect(step.params).not.toBe(params);
  });

  it('converts a list of applied steps', () => {
    const steps = toFlowSteps([
      { toolId: 'upper', toolName: 'Uppercase', params: {}, at: 1 },
      { toolId: 'append', toolName: 'Append', params: { s: 'a' }, at: 2 },
    ]);
    expect(steps).toHaveLength(2);
    expect(steps[1].params).toEqual({ s: 'a' });
  });

  it('describes a step with a numbered, param summary', () => {
    expect(describeStep({ toolId: 'append', toolName: 'Append', params: { s: '!' } }, 3)).toBe(
      '3. Append (s: !)',
    );
    expect(describeStep({ toolId: 'upper', toolName: 'Uppercase', params: {} }, 1)).toBe(
      '1. Uppercase',
    );
  });

  it('serializes steps to a line-per-step string', () => {
    const text = serializeSteps([
      { toolId: 'upper', toolName: 'Uppercase', params: {} },
      { toolId: 'append', toolName: 'Append', params: { s: '!' } },
    ]);
    expect(text).toBe('1. Uppercase\n2. Append (s: !)');
  });

  it('serializes an empty step list', () => {
    expect(serializeSteps([])).toBe('(no steps)');
  });

  it('returns the latest version or null', () => {
    const flow: Flow = {
      id: 'f',
      name: 'F',
      description: '',
      steps: [],
      versions: [
        { version: 1, steps: [], createdAt: 1 },
        { version: 2, steps: [], createdAt: 2 },
      ],
      createdAt: 1,
      updatedAt: 2,
    };
    expect(latestVersion(flow)?.version).toBe(2);
    expect(latestVersion({ ...flow, versions: [] })).toBeNull();
  });
});
