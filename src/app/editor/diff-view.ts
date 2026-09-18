import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { MergeView } from '@codemirror/merge';
import { Theme } from '../core/theme';
import { darkHighlight, lightHighlight } from './highlight';

@Component({
  selector: 'app-diff-view',
  encapsulation: ViewEncapsulation.None,
  template: ` <div #host class="diff-view" [attr.aria-label]="ariaLabel()"></div> `,
  styles: `
    .diff-view {
      block-size: 100%;
      overflow: auto;
    }
    .diff-view .cm-mergeView,
    .diff-view .cm-mergeViewEditors {
      block-size: 100%;
    }
    .diff-view .cm-editor {
      block-size: 100%;
    }
    .diff-view .cm-editor.cm-merge-a .cm-changedText,
    .diff-view .cm-deletedChunk .cm-deletedText {
      background-image: none;
      background-color: rgba(248, 81, 73, 0.3);
      border-radius: 2px;
    }
    .diff-view .cm-editor.cm-merge-b .cm-changedText {
      background-image: none;
      background-color: rgba(46, 160, 67, 0.32);
      border-radius: 2px;
    }
  `,
})
export class DiffView {
  readonly original = input<string>('');
  readonly modified = input<string>('');
  readonly ariaLabel = input<string>('Comparison');

  private readonly theme = inject(Theme);
  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private view: MergeView | null = null;
  private initialized = false;

  constructor() {
    afterNextRender(() => {
      this.initialized = true;
      this.render();
    });

    effect(() => {
      this.original();
      this.modified();
      this.theme.resolved();
      if (this.initialized) {
        this.render();
      }
    });

    inject(DestroyRef).onDestroy(() => this.view?.destroy());
  }

  private render(): void {
    this.view?.destroy();
    const highlight = this.theme.resolved() === 'dark' ? darkHighlight : lightHighlight;
    const shared: Extension = [
      lineNumbers(),
      EditorView.editable.of(false),
      EditorState.readOnly.of(true),
      EditorView.lineWrapping,
      highlight,
    ];
    this.view = new MergeView({
      a: { doc: this.original(), extensions: shared },
      b: { doc: this.modified(), extensions: shared },
      parent: this.hostRef().nativeElement,
      highlightChanges: true,
      gutter: true,
    });
  }
}
