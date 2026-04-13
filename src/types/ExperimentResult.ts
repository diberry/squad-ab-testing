// Type definitions for ExperimentResult
import { AgentRun } from './AgentRun.js';

export interface ModelMetrics {
  model: string;
  avgCost: number;
  avgLatency: number;
  avgQualityScore: number;
  costStddev: number;
  latencyStddev: number;
  qualityStddev: number;
}

export interface ExperimentResult {
  name: string;
  timestamp: string;
  runs: AgentRun[];
  modelMetrics: ModelMetrics[];
}
