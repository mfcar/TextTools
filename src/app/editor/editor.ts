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

  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');

  private readonly editableConfig = new Compartment();
  private readonly ariaConfig = new Compartment();
  private view: EditorView | null = null;

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

    inject(DestroyRef).onDestroy(() => this.view?.destroy());
  }

  private createView(): void {
    const state = EditorState.create({
      doc: this.value(),
      extensions: this.extensions(),
    });
    this.view = new EditorView({ state, parent: this.hostRef().nativeElement });
  }

  private extensions(): Extension[] {
    return [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      cmPlaceholder(this.placeholder()),
      this.editableConfig.of(EditorState.readOnly.of(this.readOnly())),
      this.ariaConfig.of(EditorView.contentAttributes.of({ 'aria-label': this.label() })),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.value.set(update.state.doc.toString());
        }
      }),
    ];
  }
}
