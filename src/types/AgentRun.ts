// Type definitions for AgentRun results
export interface AgentRun {
  model: string;
  output: string;
  repetition: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  latencyMs: number;
  outputLength: number;
  qualityScore?: number;
}
