import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ToolRegistry, provideTools } from '../core/tools/tool-registry';
import { ALL_TOOLS } from './index';

describe('ALL_TOOLS catalog', () => {
  it('contains every built-in tool', () => {
    expect(ALL_TOOLS).toHaveLength(51);
  });

  it('has unique ids', () => {
    const ids = ALL_TOOLS.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('registers cleanly and groups into the expected categories', () => {
    TestBed.configureTestingModule({ providers: [provideTools(...ALL_TOOLS)] });
    const registry = TestBed.inject(ToolRegistry);

    expect(registry.all()).toHaveLength(51);
    expect(registry.categories()).toEqual([
      'Case',
      'Conversion',
      'Crypto',
      'Encoding',
      'Format',
      'Text',
    ]);
  });
});
