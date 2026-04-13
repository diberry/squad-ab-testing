import * as path from 'node:path';
import { Task } from '../types/Task.js';

const KNOWN_EVALUATORS = ['test-pass-rate', 'lint-score'];

export class TaskBuilder {
  private basePath: string;
  private knownEvaluators: string[];

  constructor(basePath: string = process.cwd(), knownEvaluators?: string[]) {
    this.basePath = basePath;
    this.knownEvaluators = knownEvaluators ?? KNOWN_EVALUATORS;
  }

  build(prompt: string, inputFiles: string[], evaluator: string): Task {
    if (!this.knownEvaluators.includes(evaluator)) {
      throw new Error(`Unknown evaluator: ${evaluator}`);
    }

    const resolvedFiles = inputFiles.map(f =>
      path.isAbsolute(f) ? f : path.resolve(this.basePath, f)
    );

    return {
      prompt,
      inputFiles: resolvedFiles,
      evaluator,
    };
  }
}
