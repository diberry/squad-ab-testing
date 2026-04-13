import { EvaluatorFunction } from '../types/Evaluator.js';

export class EvaluatorRegistry {
  private evaluators: Map<string, EvaluatorFunction> = new Map();

  register(name: string, evaluator: EvaluatorFunction): void {
    this.evaluators.set(name, evaluator);
  }

  get(name: string): EvaluatorFunction {
    const evaluator = this.evaluators.get(name);
    if (!evaluator) {
      throw new Error(`Evaluator not found: ${name}`);
    }
    return evaluator;
  }

  has(name: string): boolean {
    return this.evaluators.has(name);
  }
}
