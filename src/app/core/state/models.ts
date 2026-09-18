import type { ToolParams } from '../tools/param-schema';

export interface FlowRunGroup {
  readonly runId: string;
  readonly flowId: string;
  readonly flowName: string;
}

export interface AppliedStep {
  readonly toolId: string;
  readonly toolName: string;
  readonly params: ToolParams;
  readonly at: number;
  readonly group?: FlowRunGroup;
}

export interface FlowStep {
  readonly toolId: string;
  readonly toolName: string;
  readonly params: ToolParams;
  readonly ask?: readonly string[];
}

export interface FlowVersion {
  readonly version: number;
  readonly steps: readonly FlowStep[];
  readonly createdAt: number;
}

export interface Flow {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly steps: readonly FlowStep[];
  readonly versions: readonly FlowVersion[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface Checkpoint {
  readonly index: number;
  readonly content: string;
}

export interface TextDocument {
  readonly id: string;
  readonly name: string;
  readonly baseContent: string;
  readonly currentContent: string;
  readonly history: readonly AppliedStep[];
  readonly cursor: number;
  readonly checkpoints: readonly Checkpoint[];
  readonly createdAt: number;
  readonly order: number;
  readonly pinned: boolean;
  readonly language: string;
}
