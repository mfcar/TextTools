import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { Theme } from './theme';

describe('Theme', () => {
  let service: Theme;
  let document: Document;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(Theme);
    document = TestBed.inject(DOCUMENT);
  });

  it('should default to the system preference', () => {
    expect(service.preference()).toBe('system');
  });

  it('should apply `light dark` to the document color-scheme for the system preference', () => {
    TestBed.tick();
    expect(document.documentElement.style.colorScheme).toBe('light dark');
  });

  it('should apply an explicit color-scheme when a preference is set', () => {
    service.set('dark');
    TestBed.tick();
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('should cycle system → light → dark → system', () => {
    expect(service.preference()).toBe('system');
    service.cycle();
    expect(service.preference()).toBe('light');
    service.cycle();
    expect(service.preference()).toBe('dark');
    service.cycle();
    expect(service.preference()).toBe('system');
  });
});
