// Type definitions for RunMetrics
export interface RunMetrics {
  model: string;
  repetition: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  latencyMs: number;
  outputLength: number;
}
