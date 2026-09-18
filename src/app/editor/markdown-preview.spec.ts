import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { MarkdownPreview } from './markdown-preview';

async function flushRender(fixture: ComponentFixture<MarkdownPreview>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  fixture.detectChanges();
}

describe('MarkdownPreview', () => {
  let fixture: ComponentFixture<MarkdownPreview>;
  let ref: ComponentRef<MarkdownPreview>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownPreview);
    ref = fixture.componentRef;
  });

  it('renders Markdown to HTML', async () => {
    ref.setInput('content', '# Title\n\nSome **bold** text.');
    fixture.detectChanges();
    await flushRender(fixture);

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('h1')?.textContent).toBe('Title');
    expect(host.querySelector('strong')?.textContent).toBe('bold');
  });

  it('strips dangerous markup', async () => {
    ref.setInput('content', 'Hello <script>alert(1)</script> <img src=x onerror="alert(2)">');
    fixture.detectChanges();
    await flushRender(fixture);

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('script')).toBeNull();
    expect(host.querySelector('img')?.getAttribute('onerror')).toBeNull();
  });
});
