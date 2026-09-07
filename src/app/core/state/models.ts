import type { ToolParams } from '../tools/param-schema';

export interface AppliedStep {
  readonly toolId: string;
  readonly toolName: string;
  readonly params: ToolParams;
  readonly at: number;
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
}
