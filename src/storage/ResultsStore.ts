import * as fs from 'node:fs';
import * as path from 'node:path';
import { ExperimentResult } from '../types/ExperimentResult.js';

export interface StoredResult {
  experiments: ExperimentResult[];
}

export class ResultsStore {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  private filePath(experimentName: string): string {
    const safeName = experimentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.basePath, `${safeName}.json`);
  }

  save(result: ExperimentResult): void {
    fs.mkdirSync(this.basePath, { recursive: true });
    const fp = this.filePath(result.name);
    let stored: StoredResult = { experiments: [] };
    if (fs.existsSync(fp)) {
      stored = JSON.parse(fs.readFileSync(fp, 'utf-8'));
    }
    stored.experiments.push(result);
    fs.writeFileSync(fp, JSON.stringify(stored, null, 2));
  }

  load(experimentName: string): StoredResult | null {
    const fp = this.filePath(experimentName);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
  }
}
