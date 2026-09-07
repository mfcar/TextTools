import { InjectionToken } from '@angular/core';

export const CHECKPOINT_INTERVAL = 10;

export const HISTORY_CAP = 500;

export const CHECKPOINT_BUDGET_BYTES = 32 * 1024 * 1024;

export interface HistoryConfig {
  readonly checkpointInterval: number;
  readonly historyCap: number;
  readonly checkpointBudgetBytes: number;
}

export const DEFAULT_HISTORY_CONFIG: HistoryConfig = {
  checkpointInterval: CHECKPOINT_INTERVAL,
  historyCap: HISTORY_CAP,
  checkpointBudgetBytes: CHECKPOINT_BUDGET_BYTES,
};

export const HISTORY_CONFIG = new InjectionToken<HistoryConfig>('HISTORY_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_HISTORY_CONFIG,
});
