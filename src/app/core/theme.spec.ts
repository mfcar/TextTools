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

  it('should resolve an explicit preference regardless of the system scheme', () => {
    service.set('light');
    expect(service.resolved()).toBe('light');
    service.set('dark');
    expect(service.resolved()).toBe('dark');
  });
});

describe('Theme — system scheme', () => {
  let changeHandler: ((event: MediaQueryListEvent) => void) | null;

  beforeEach(() => {
    localStorage.clear();
    changeHandler = null;
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: (_type: string, handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      },
      removeEventListener: () => {
        changeHandler = null;
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves the system preference from prefers-color-scheme', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(Theme);
    expect(service.preference()).toBe('system');
    expect(service.resolved()).toBe('dark');
  });

  it('reacts when the OS scheme changes while system is selected', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(Theme);
    expect(service.resolved()).toBe('dark');

    changeHandler?.({ matches: false } as MediaQueryListEvent);
    expect(service.resolved()).toBe('light');
  });
});
