import {
  EnvironmentProviders,
  InjectionToken,
  Service,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { executeTool } from './execute-tool';
import { ToolDefinition, ToolResult, failure } from './tool';

export const TOOL_DEFINITIONS = new InjectionToken<readonly ToolDefinition[]>('TOOL_DEFINITIONS');

export function provideTools(...tools: readonly ToolDefinition[]): EnvironmentProviders {
  return makeEnvironmentProviders(
    tools.map((tool) => ({ provide: TOOL_DEFINITIONS, useValue: tool, multi: true })),
  );
}

export interface ToolGroup {
  readonly category: string;
  readonly tools: readonly ToolDefinition[];
}

/**
 * Central catalog of tools. Indexes definitions by id and exposes lookup,
 * grouping, search, and validated execution. Populated from `provideTools`.
 */
@Service()
export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  constructor() {
    this.registerAll(inject(TOOL_DEFINITIONS, { optional: true }) ?? []);
  }

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`A tool with id "${tool.id}" is already registered.`);
    }
    this.tools.set(tool.id, tool);
  }

  registerAll(tools: readonly ToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  has(id: string): boolean {
    return this.tools.has(id);
  }

  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  all(): readonly ToolDefinition[] {
    return [...this.tools.values()];
  }

  /** Distinct category names, sorted alphabetically. */
  categories(): readonly string[] {
    return [...new Set(this.all().map((tool) => tool.category))].sort((a, b) => a.localeCompare(b));
  }

  byCategory(): readonly ToolGroup[] {
    return this.categories().map((category) => ({
      category,
      tools: this.all().filter((tool) => tool.category === category),
    }));
  }

  /**
   * Case-insensitive search across id, name, description, category, and tags.
   * Every whitespace-separated term must match somewhere (AND semantics).
   */
  search(query: string): readonly ToolDefinition[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return this.all();
    }
    return this.all().filter((tool) => {
      const haystack = [tool.id, tool.name, tool.description, tool.category, ...tool.tags]
        .join(' ')
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  /**
   * Validates params against the tool's schema, runs it, and normalizes the
   * outcome into a `ToolResult`. Unknown ids, validation failures, and thrown
   * errors all surface as `failure` — this never throws.
   */
  async execute(
    id: string,
    input: string,
    rawParams: Readonly<Record<string, unknown>> = {},
  ): Promise<ToolResult> {
    const tool = this.get(id);
    if (!tool) {
      return failure(`Unknown tool "${id}".`);
    }
    return executeTool(tool, input, rawParams);
  }
}
