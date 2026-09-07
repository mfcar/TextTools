import { Service, inject } from '@angular/core';
import { shouldOffload } from '../perf/offload-policy';
import { ToolParams } from './param-schema';
import { ToolRegistry } from './tool-registry';
import { ToolResult, failure } from './tool';
import { WorkerToolRunner } from './worker-tool-runner';

@Service()
export class ToolExecutor {
  private readonly registry = inject(ToolRegistry);
  private readonly worker = inject(WorkerToolRunner);

  execute(toolId: string, input: string, params: ToolParams = {}): Promise<ToolResult> {
    const tool = this.registry.get(toolId);
    if (!tool) {
      return Promise.resolve(failure(`Unknown tool "${toolId}".`));
    }
    if (this.worker.supported && shouldOffload(tool, input)) {
      return this.worker.run(toolId, input, params);
    }
    return this.registry.execute(toolId, input, params);
  }
}
