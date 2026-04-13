import { ExperimentResult } from '../types/ExperimentResult.js';

export class JsonReporter {
  toJson(result: ExperimentResult): string {
    return JSON.stringify(result, null, 2);
  }
}
