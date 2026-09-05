import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Editor } from './editor';

describe('Editor', () => {
  let fixture: ComponentFixture<Editor>;
  let component: Editor;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [Editor] });
    fixture = TestBed.createComponent(Editor);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function content(): string {
    return fixture.nativeElement.querySelector('.cm-content')?.textContent ?? '';
  }

  it('creates and mounts a CodeMirror editor', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cm-editor')).toBeTruthy();
  });

  it('renders the initial value', async () => {
    fixture.componentRef.setInput('value', 'hello world');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(content()).toContain('hello world');
  });

  it('reflects external value changes into the document', async () => {
    fixture.componentRef.setInput('value', 'first');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(content()).toContain('first');

    fixture.componentRef.setInput('value', 'second');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(content()).toContain('second');
    expect(content()).not.toContain('first');
  });

  it('exposes an accessible label on the editing region', async () => {
    fixture.componentRef.setInput('label', 'Document body');
    fixture.detectChanges();
    await fixture.whenStable();
    const editable = fixture.nativeElement.querySelector('.cm-content');
    expect(editable?.getAttribute('aria-label')).toBe('Document body');
  });

  it('renders a status bar', () => {
    expect(fixture.nativeElement.querySelector('.editor__status')).toBeTruthy();
  });
});
