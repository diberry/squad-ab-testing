import * as fs from 'node:fs';
import { ConfigParser } from '../config/ConfigParser.js';
import { Orchestrator } from '../orchestration/Orchestrator.js';
import { Reporter } from '../reporting/Reporter.js';
import { ResultsStore } from '../storage/ResultsStore.js';
import { AgentExecutor } from '../agent/AgentSpawner.js';

export interface RunExperimentOptions {
  executor: AgentExecutor;
  storagePath?: string;
  maxConcurrent?: number;
}

export async function runExperiment(
  configPath: string,
  options: RunExperimentOptions
): Promise<{ exitCode: number; output: string }> {
  try {
    const json = fs.readFileSync(configPath, 'utf-8');
    const parser = new ConfigParser();
    const config = parser.parse(json);

    const orchestrator = new Orchestrator(options.executor, {
      maxConcurrent: options.maxConcurrent,
    });

    const result = await orchestrator.run(config);
    const reporter = new Reporter();
    const table = reporter.formatTable(result);

    if (options.storagePath) {
      const store = new ResultsStore(options.storagePath);
      store.save(result);
    }

    return { exitCode: 0, output: table };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { exitCode: 1, output: `Error: ${message}` };
  }
}
