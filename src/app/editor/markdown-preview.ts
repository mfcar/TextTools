import { Component, ViewEncapsulation, effect, input, signal } from '@angular/core';

const RENDER_DEBOUNCE_MS = 200;

@Component({
  selector: 'app-markdown-preview',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      class="markdown-preview"
      role="document"
      aria-label="Markdown preview"
      [innerHTML]="html()"
    ></div>
  `,
  styles: `
    .markdown-preview {
      block-size: 100%;
      overflow: auto;
      padding: 1rem 1.25rem;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface);
      line-height: 1.6;
    }
    .markdown-preview h1,
    .markdown-preview h2,
    .markdown-preview h3,
    .markdown-preview h4 {
      margin-block: 1.2em 0.5em;
      line-height: 1.25;
    }
    .markdown-preview h1 {
      padding-block-end: 0.3em;
      border-block-end: 1px solid var(--mat-sys-outline-variant);
    }
    .markdown-preview a {
      color: var(--mat-sys-primary);
    }
    .markdown-preview code {
      padding: 0.15em 0.35em;
      background: var(--mat-sys-surface-container-high);
      border-radius: 4px;
      font-family: monospace;
    }
    .markdown-preview pre {
      padding: 0.75rem 1rem;
      overflow: auto;
      background: var(--mat-sys-surface-container-high);
      border-radius: 6px;
    }
    .markdown-preview pre code {
      padding: 0;
      background: none;
    }
    .markdown-preview blockquote {
      margin-inline: 0;
      padding-inline-start: 1rem;
      color: var(--mat-sys-on-surface-variant);
      border-inline-start: 3px solid var(--mat-sys-outline-variant);
    }
    .markdown-preview table {
      border-collapse: collapse;
    }
    .markdown-preview th,
    .markdown-preview td {
      padding: 0.35rem 0.75rem;
      border: 1px solid var(--mat-sys-outline-variant);
    }
    .markdown-preview img {
      max-inline-size: 100%;
    }
  `,
})
export class MarkdownPreview {
  readonly content = input<string>('');

  protected readonly html = signal<string>('');
  private renderToken = 0;

  constructor() {
    effect((onCleanup) => {
      const source = this.content();
      const handle = setTimeout(() => void this.render(source), RENDER_DEBOUNCE_MS);
      onCleanup(() => clearTimeout(handle));
    });
  }

  private async render(source: string): Promise<void> {
    const token = ++this.renderToken;
    const [{ marked }, { default: DOMPurify }] = await Promise.all([
      import('marked'),
      import('dompurify'),
    ]);
    const raw = await marked.parse(source);
    if (token !== this.renderToken) {
      return;
    }
    this.html.set(DOMPurify.sanitize(raw));
  }
}
