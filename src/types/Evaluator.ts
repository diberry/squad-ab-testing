// Type definitions for Evaluator
export type EvaluatorFunction = (output: string) => Promise<number>;

export interface Evaluator {
  name: string;
  evaluate: EvaluatorFunction;
}
