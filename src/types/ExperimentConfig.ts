// Type definitions for ExperimentConfig
export interface ExperimentConfig {
  name: string;
  task: {
    prompt: string;
    inputFiles: string[];
    evaluator: string;
  };
  models: string[];
  repetitions: number;
  budget?: {
    maxPerRun?: number;
    maxTotal?: number;
  };
}
