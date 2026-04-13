import { ExperimentResult, ModelMetrics } from '../types/ExperimentResult.js';

export class Reporter {
  formatTable(result: ExperimentResult): string {
    const sorted = [...result.modelMetrics].sort(
      (a, b) => b.avgQualityScore - a.avgQualityScore
    );

    const repetitions = result.runs.length > 0
      ? Math.max(...[...new Set(result.runs.map(r => r.repetition))])
      : 0;

    const lines: string[] = [];
    lines.push(`Experiment: ${result.name}`);
    lines.push(`Date: ${result.timestamp}`);
    lines.push(`N=${repetitions} repetitions`);
    lines.push('');

    const header = this.padRow(['Model', 'Avg Cost', 'Avg Latency', 'Quality', 'Stddev']);
    const separator = '-'.repeat(header.length);
    lines.push(header);
    lines.push(separator);

    for (const m of sorted) {
      lines.push(
        this.padRow([
          m.model,
          m.avgCost.toFixed(4),
          m.avgLatency.toFixed(0) + 'ms',
          m.avgQualityScore.toFixed(3),
          m.qualityStddev.toFixed(3),
        ])
      );
    }

    return lines.join('\n');
  }

  print(result: ExperimentResult): void {
    console.log(this.formatTable(result));
  }

  private padRow(cols: string[]): string {
    const widths = [20, 12, 14, 10, 10];
    return cols.map((c, i) => c.padEnd(widths[i] || 10)).join('| ');
  }
}
