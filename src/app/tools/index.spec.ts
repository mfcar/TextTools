import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ToolRegistry, provideTools } from '../core/tools/tool-registry';
import { ALL_TOOLS } from './index';

describe('ALL_TOOLS catalog', () => {
  it('contains the 24 ported tools', () => {
    expect(ALL_TOOLS).toHaveLength(24);
  });

  it('has unique ids', () => {
    const ids = ALL_TOOLS.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('registers cleanly and groups into the expected categories', () => {
    TestBed.configureTestingModule({ providers: [provideTools(...ALL_TOOLS)] });
    const registry = TestBed.inject(ToolRegistry);

    expect(registry.all()).toHaveLength(24);
    expect(registry.categories()).toEqual(['Case', 'Encoding', 'Text']);
  });
});
