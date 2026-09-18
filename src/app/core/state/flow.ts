import type { AppliedStep, Flow, FlowStep, FlowVersion } from './models';
import type { ToolParams } from '../tools/param-schema';

export function toFlowStep(step: AppliedStep | FlowStep): FlowStep {
  return { toolId: step.toolId, toolName: step.toolName, params: { ...step.params } };
}

export function toFlowSteps(steps: readonly (AppliedStep | FlowStep)[]): readonly FlowStep[] {
  return steps.map(toFlowStep);
}

/** Human-readable single line for one step, used in version diffs and summaries. */
export function describeStep(step: FlowStep, position: number): string {
  const params = paramSummary(step.params);
  const suffix = params ? ` (${params})` : '';
  return `${position}. ${step.toolName}${suffix}`;
}

function paramSummary(params: ToolParams): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(', ');
}

/** Serializes a version's steps to a diff-friendly, line-per-step string. */
export function serializeSteps(steps: readonly FlowStep[]): string {
  if (!steps.length) {
    return '(no steps)';
  }
  return steps.map((step, index) => describeStep(step, index + 1)).join('\n');
}

export function latestVersion(flow: Flow): FlowVersion | null {
  return flow.versions.length ? flow.versions[flow.versions.length - 1] : null;
}
