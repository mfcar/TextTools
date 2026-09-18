import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { Compartment, EditorState, Extension } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as cmPlaceholder,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  closeSearchPanel,
  openSearchPanel,
  search,
  searchKeymap,
  searchPanelOpen,
} from '@codemirror/search';
import { Theme } from '../core/theme';
import { darkHighlight, lightHighlight } from './highlight';
import { PLAINTEXT, loadLanguage } from './languages';
import { countGraphemes, countLines } from './text-metrics';

const COUNT_DEBOUNCE_MS = 200;

@Component({
  selector: 'app-editor',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="editor">
      <div #host class="editor__host"></div>
      <div class="editor__status">
        <span>{{ lineCount() }} {{ lineCount() === 1 ? 'line' : 'lines' }}</span>
        <span>{{ charCount() }} {{ charCount() === 1 ? 'character' : 'characters' }}</span>
      </div>
    </div>
  `,
  styles: `
    .editor {
      display: flex;
      flex-direction: column;
      block-size: 100%;
      min-block-size: 0;
    }
    .editor__host {
      flex: 1 1 auto;
      min-block-size: 0;
      overflow: hidden;
    }
    .editor__host .cm-editor {
      block-size: 100%;
    }
    .editor__host .cm-editor.cm-focused {
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: -2px;
    }
    .editor__host .cm-panels {
      background: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
    }
    .editor__host .cm-panels.cm-panels-top {
      border-block-end: 1px solid var(--mat-sys-outline-variant);
    }
    .editor__host .cm-search {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 0.6rem;
      padding: 0.6rem 2.25rem 0.6rem 0.75rem;
    }
    .editor__host .cm-search br {
      flex-basis: 100%;
      block-size: 0;
      margin: 0;
      border: 0;
    }
    .editor__host .cm-search label {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .editor__host .cm-search .cm-textfield {
      margin: 0;
      padding: 0.3rem 0.55rem;
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
      border: 1px solid var(--mat-sys-outline);
      border-radius: 6px;
    }
    .editor__host .cm-search .cm-button {
      margin: 0;
      padding: 0.3rem 0.7rem;
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface);
      border: 1px solid var(--mat-sys-outline);
      border-radius: 6px;
      background-image: none;
    }
    .editor__host .cm-search .cm-button:hover {
      background: var(--mat-sys-surface-container-highest);
    }
    .editor__host .cm-search [name='close'] {
      inset-block-start: 0.35rem;
      inset-inline-end: 0.5rem;
      padding: 0.1rem 0.3rem;
      font-size: 1.1rem;
      color: var(--mat-sys-on-surface-variant);
    }
    .editor__status {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 0.25rem 0.75rem;
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      border-block-start: 1px solid var(--mat-sys-outline-variant);
    }
  `,
})
export class Editor {
  readonly value = model<string>('');
  readonly label = input<string>('Text editor');
  readonly placeholder = input<string>('');
  readonly readOnly = input<boolean>(false);
  readonly searchOpen = model<boolean>(false);
  readonly language = input<string>(PLAINTEXT);

  private readonly theme = inject(Theme);
  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');

  private readonly editableConfig = new Compartment();
  private readonly ariaConfig = new Compartment();
  private readonly languageConfig = new Compartment();
  private readonly highlightConfig = new Compartment();
  private view: EditorView | null = null;
  private languageToken = 0;

  private readonly debouncedValue = signal('');
  protected readonly charCount = computed(() => countGraphemes(this.debouncedValue()));
  protected readonly lineCount = computed(() => countLines(this.debouncedValue()));

  constructor() {
    this.debouncedValue.set(this.value());

    afterNextRender(() => this.createView());

    effect(() => {
      const next = this.value();
      const view = this.view;
      if (view && view.state.doc.toString() !== next) {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
      }
    });

    effect(() => {
      const readOnly = this.readOnly();
      const label = this.label();
      this.view?.dispatch({
        effects: [
          this.editableConfig.reconfigure(EditorState.readOnly.of(readOnly)),
          this.ariaConfig.reconfigure(EditorView.contentAttributes.of({ 'aria-label': label })),
        ],
      });
    });

    effect((onCleanup) => {
      const next = this.value();
      const handle = setTimeout(() => this.debouncedValue.set(next), COUNT_DEBOUNCE_MS);
      onCleanup(() => clearTimeout(handle));
    });

    effect(() => {
      const open = this.searchOpen();
      const view = this.view;
      if (!view) {
        return;
      }
      const isOpen = searchPanelOpen(view.state);
      if (open && !isOpen) {
        openSearchPanel(view);
        view.focus();
      } else if (!open && isOpen) {
        closeSearchPanel(view);
      }
    });

    effect(() => {
      const highlight = this.theme.resolved() === 'dark' ? darkHighlight : lightHighlight;
      this.view?.dispatch({ effects: this.highlightConfig.reconfigure(highlight) });
    });

    effect(() => {
      void this.applyLanguage(this.language());
    });

    inject(DestroyRef).onDestroy(() => this.view?.destroy());
  }

  private createView(): void {
    const state = EditorState.create({
      doc: this.value(),
      extensions: this.extensions(),
    });
    this.view = new EditorView({ state, parent: this.hostRef().nativeElement });
    void this.applyLanguage(this.language());
    if (this.searchOpen()) {
      openSearchPanel(this.view);
    }
  }

  private async applyLanguage(id: string): Promise<void> {
    if (!this.view) {
      return;
    }
    const token = ++this.languageToken;
    const support = id === PLAINTEXT ? null : await loadLanguage(id);
    if (token !== this.languageToken || !this.view) {
      return;
    }
    this.view.dispatch({ effects: this.languageConfig.reconfigure(support ?? []) });
  }

  private extensions(): Extension[] {
    return [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      search({ top: true }),
      keymap.of([...searchKeymap, ...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      cmPlaceholder(this.placeholder()),
      this.languageConfig.of([]),
      this.highlightConfig.of(this.theme.resolved() === 'dark' ? darkHighlight : lightHighlight),
      this.editableConfig.of(EditorState.readOnly.of(this.readOnly())),
      this.ariaConfig.of(EditorView.contentAttributes.of({ 'aria-label': this.label() })),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.value.set(update.state.doc.toString());
        }
        const open = searchPanelOpen(update.state);
        if (open !== searchPanelOpen(update.startState)) {
          this.searchOpen.set(open);
        }
      }),
    ];
  }
}
