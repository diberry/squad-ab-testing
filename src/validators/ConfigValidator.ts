import { ExperimentConfig } from '../types/ExperimentConfig.js';

export class ConfigValidator {
  private knownModels: string[];

  constructor(knownModels: string[]) {
    this.knownModels = knownModels;
  }

  validate(config: ExperimentConfig): void {
    if (!config || typeof config !== 'object') {
      throw new Error('Config must be an object');
    }
    if (!config.task || typeof config.task !== 'object' || !config.task.prompt) {
      throw new Error('Config missing required field: task');
    }
    if (!Array.isArray(config.models) || config.models.length === 0) {
      throw new Error('Config missing required field: models');
    }
    if (config.repetitions === undefined || config.repetitions === null) {
      throw new Error('Config missing required field: repetitions');
    }
    if (!Number.isInteger(config.repetitions) || config.repetitions <= 0) {
      throw new Error('Repetitions must be a positive integer');
    }

    for (const model of config.models) {
      if (!this.knownModels.includes(model)) {
        throw new Error(`Unknown model: ${model}`);
      }
    }
  }
}
