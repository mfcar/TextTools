import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { HISTORY_CONFIG } from '../perf/history-policy';
import { ToolParams } from '../tools/param-schema';
import { ToolExecutor } from '../tools/tool-executor';
import { ToolRegistry } from '../tools/tool-registry';
import { ToolResult, failure } from '../tools/tool';
import { PLAINTEXT } from '../../editor/languages';
import { AppliedStep, Checkpoint, Flow, TextDocument } from './models';
import {
  StepRunner,
  isCheckpointIndex,
  pruneCheckpoints,
  replayTo,
  selectReplayStart,
} from './history';

interface DocumentState {
  readonly activeId: string | null;
  readonly untitledCount: number;
}

const initialState: DocumentState = {
  activeId: null,
  untitledCount: 0,
};

function newId(): string {
  return crypto.randomUUID();
}

export interface OpenDocumentOptions {
  readonly name?: string;
  readonly content?: string;
  readonly language?: string;
}

export interface FlowRunResult {
  readonly ok: boolean;
  readonly appliedCount: number;
  readonly error?: string;
}

export const DocumentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<TextDocument>(),
  withComputed((store) => ({
    activeDocument: computed<TextDocument | null>(() => {
      const id = store.activeId();
      return id ? (store.entityMap()[id] ?? null) : null;
    }),
    orderedDocuments: computed<readonly TextDocument[]>(() =>
      [...store.entities()].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || a.order - b.order,
      ),
    ),
  })),
  withComputed((store) => ({
    canUndo: computed(() => (store.activeDocument()?.cursor ?? 0) > 0),
    canRedo: computed(() => {
      const doc = store.activeDocument();
      return doc ? doc.cursor < doc.history.length : false;
    }),
  })),
  withMethods((store) => {
    const registry = inject(ToolRegistry);
    const executor = inject(ToolExecutor);
    const config = inject(HISTORY_CONFIG);
    const run: StepRunner = (step, input) => executor.execute(step.toolId, input, step.params);

    const appendStep = async (
      doc: TextDocument,
      step: AppliedStep,
      output: string,
    ): Promise<Partial<TextDocument>> => {
      const history = [...doc.history.slice(0, doc.cursor), step];
      let cursor = history.length;
      let baseContent = doc.baseContent;

      let checkpoints: readonly Checkpoint[] = doc.checkpoints.filter(
        (cp) => cp.index <= doc.cursor,
      );
      if (isCheckpointIndex(cursor, config.checkpointInterval)) {
        checkpoints = pruneCheckpoints(
          [...checkpoints, { index: cursor, content: output }],
          config.checkpointBudgetBytes,
        );
      }

      let finalHistory: readonly AppliedStep[] = history;
      if (finalHistory.length > config.historyCap) {
        const drop = finalHistory.length - config.historyCap;
        baseContent = await replayTo(run, baseContent, checkpoints, finalHistory, drop);
        finalHistory = finalHistory.slice(drop);
        cursor -= drop;
        checkpoints = checkpoints
          .filter((cp) => cp.index > drop)
          .map((cp) => ({ index: cp.index - drop, content: cp.content }));
      }

      return { baseContent, currentContent: output, history: finalHistory, cursor, checkpoints };
    };

    const open = (options: OpenDocumentOptions = {}): string => {
      const id = newId();
      const untitledCount = store.untitledCount() + 1;
      const content = options.content ?? '';
      const nextOrder = store.entities().reduce((max, doc) => Math.max(max, doc.order), -1) + 1;
      const document: TextDocument = {
        id,
        name: options.name ?? `Untitled ${untitledCount}`,
        baseContent: content,
        currentContent: content,
        history: [],
        cursor: 0,
        checkpoints: [],
        createdAt: Date.now(),
        order: nextOrder,
        pinned: false,
        language: options.language ?? PLAINTEXT,
      };
      patchState(store, addEntity(document), { activeId: id, untitledCount });
      return id;
    };

    return {
      hydrate(documents: readonly TextDocument[], activeId: string | null): void {
        const known = new Set(documents.map((doc) => doc.id));
        const nextActive = activeId && known.has(activeId) ? activeId : (documents[0]?.id ?? null);
        const untitledCount = documents.reduce((max, doc) => {
          const match = /^Untitled (\d+)$/.exec(doc.name);
          return match ? Math.max(max, Number(match[1])) : max;
        }, 0);
        const normalized = documents.map((doc, index) => ({
          ...doc,
          order: doc.order ?? index,
          pinned: doc.pinned ?? false,
          language: doc.language ?? PLAINTEXT,
        }));
        patchState(store, setAllEntities(normalized), {
          activeId: nextActive,
          untitledCount,
        });
      },

      openDocument(options: OpenDocumentOptions = {}): string {
        return open(options);
      },

      setActive(id: string): void {
        if (store.entityMap()[id]) {
          patchState(store, { activeId: id });
        }
      },

      renameDocument(id: string, name: string): void {
        if (store.entityMap()[id]) {
          patchState(store, updateEntity({ id, changes: { name } }));
        }
      },

      setLanguage(id: string, language: string): void {
        if (store.entityMap()[id]) {
          patchState(store, updateEntity({ id, changes: { language } }));
        }
      },

      closeDocument(id: string): void {
        if (!store.entityMap()[id]) {
          return;
        }
        const order = store.ids() as string[];
        const position = order.indexOf(id);
        const remaining = order.filter((other) => other !== id);
        const nextActive =
          store.activeId() === id
            ? (remaining[Math.max(0, position - 1)] ?? null)
            : store.activeId();
        patchState(store, removeEntity(id), { activeId: nextActive });
      },

      setContent(id: string, content: string): void {
        const doc = store.entityMap()[id];
        if (!doc || doc.currentContent === content) {
          return;
        }
        patchState(
          store,
          updateEntity({
            id,
            changes: {
              baseContent: content,
              currentContent: content,
              history: [],
              cursor: 0,
              checkpoints: [],
            },
          }),
        );
      },

      async applyTool(id: string, toolId: string, params: ToolParams = {}): Promise<ToolResult> {
        const doc = store.entityMap()[id];
        if (!doc) {
          return failure(`Unknown document "${id}".`);
        }
        const tool = registry.get(toolId);
        if (!tool) {
          return failure(`Unknown tool "${toolId}".`);
        }

        const result = await executor.execute(toolId, doc.currentContent, params);
        if (!result.ok) {
          return result;
        }

        const step: AppliedStep = { toolId, toolName: tool.name, params, at: Date.now() };
        const changes = await appendStep(doc, step, result.output);
        patchState(store, updateEntity({ id, changes }));
        return result;
      },

      async applyFlow(
        id: string,
        flow: Flow,
        overrides: readonly ToolParams[] = [],
      ): Promise<FlowRunResult> {
        if (!store.entityMap()[id]) {
          return { ok: false, appliedCount: 0, error: `Unknown document "${id}".` };
        }
        if (flow.steps.length === 0) {
          return { ok: false, appliedCount: 0, error: 'This flow has no steps to run.' };
        }
        const runId = newId();
        let applied = 0;
        for (const [index, flowStep] of flow.steps.entries()) {
          const doc = store.entityMap()[id];
          if (!doc) {
            return { ok: false, appliedCount: applied, error: `Unknown document "${id}".` };
          }
          const tool = registry.get(flowStep.toolId);
          if (!tool) {
            return {
              ok: false,
              appliedCount: applied,
              error: `Step ${applied + 1}: unknown tool "${flowStep.toolId}".`,
            };
          }
          const params = { ...flowStep.params, ...overrides[index] };
          const result = await executor.execute(flowStep.toolId, doc.currentContent, params);
          if (!result.ok) {
            return {
              ok: false,
              appliedCount: applied,
              error: `Step ${applied + 1} (${flowStep.toolName}): ${result.error}`,
            };
          }
          const step: AppliedStep = {
            toolId: flowStep.toolId,
            toolName: flowStep.toolName,
            params,
            at: Date.now(),
            group: { runId, flowId: flow.id, flowName: flow.name },
          };
          const changes = await appendStep(doc, step, result.output);
          patchState(store, updateEntity({ id, changes }));
          applied += 1;
        }
        return { ok: true, appliedCount: applied };
      },

      async undo(id: string): Promise<void> {
        const doc = store.entityMap()[id];
        if (!doc || doc.cursor === 0) {
          return;
        }
        const target = doc.cursor - 1;
        const content = await replayTo(run, doc.baseContent, doc.checkpoints, doc.history, target);
        patchState(
          store,
          updateEntity({ id, changes: { currentContent: content, cursor: target } }),
        );
      },

      async redo(id: string): Promise<void> {
        const doc = store.entityMap()[id];
        if (!doc || doc.cursor >= doc.history.length) {
          return;
        }
        const target = doc.cursor + 1;
        const content = await replayTo(run, doc.baseContent, doc.checkpoints, doc.history, target);

        let checkpoints = doc.checkpoints;
        if (
          isCheckpointIndex(target, config.checkpointInterval) &&
          selectReplayStart(doc.baseContent, checkpoints, target).index !== target
        ) {
          checkpoints = pruneCheckpoints(
            [...checkpoints, { index: target, content }],
            config.checkpointBudgetBytes,
          );
        }

        patchState(
          store,
          updateEntity({ id, changes: { currentContent: content, cursor: target, checkpoints } }),
        );
      },

      async goTo(id: string, target: number): Promise<void> {
        const doc = store.entityMap()[id];
        if (!doc) {
          return;
        }
        const clamped = Math.max(0, Math.min(target, doc.history.length));
        if (clamped === doc.cursor) {
          return;
        }
        const content = await replayTo(run, doc.baseContent, doc.checkpoints, doc.history, clamped);

        let checkpoints = doc.checkpoints;
        if (
          isCheckpointIndex(clamped, config.checkpointInterval) &&
          selectReplayStart(doc.baseContent, checkpoints, clamped).index !== clamped
        ) {
          checkpoints = pruneCheckpoints(
            [...checkpoints, { index: clamped, content }],
            config.checkpointBudgetBytes,
          );
        }

        patchState(
          store,
          updateEntity({ id, changes: { currentContent: content, cursor: clamped, checkpoints } }),
        );
      },

      clearHistory(id: string): void {
        const doc = store.entityMap()[id];
        if (!doc) {
          return;
        }
        patchState(
          store,
          updateEntity({
            id,
            changes: {
              baseContent: doc.currentContent,
              history: [],
              cursor: 0,
              checkpoints: [],
            },
          }),
        );
      },

      togglePin(id: string): void {
        const doc = store.entityMap()[id];
        if (!doc) {
          return;
        }
        patchState(store, updateEntity({ id, changes: { pinned: !doc.pinned } }));
      },

      reorderDocuments(orderedIds: readonly string[]): void {
        for (const [index, id] of orderedIds.entries()) {
          if (store.entityMap()[id]) {
            patchState(store, updateEntity({ id, changes: { order: index } }));
          }
        }
      },

      async branchFromHistory(
        id: string,
        targetIndex: number,
        name: string,
      ): Promise<string | null> {
        const doc = store.entityMap()[id];
        if (!doc) {
          return null;
        }
        const clamped = Math.max(0, Math.min(targetIndex, doc.history.length));
        const content = await replayTo(run, doc.baseContent, doc.checkpoints, doc.history, clamped);
        return open({ name, content });
      },
    };
  }),
);
