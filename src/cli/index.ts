#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import { runExperiment } from './runExperiment.js';
import { Task } from '../types/Task.js';
import { getKnownModels } from '../config/ConfigParser.js';

/**
 * Built-in mock executor that simulates model responses with
 * realistic-looking token counts, latency, and costs.
 * Users never need to write an executor themselves.
 */
function createMockExecutor() {
  const modelProfiles: Record<string, { costPer1k: number; baseLatency: number; quality: number }> = {
    'gpt-4o':                { costPer1k: 0.03,   baseLatency: 1200, quality: 0.93 },
    'gpt-4o-mini':           { costPer1k: 0.015,  baseLatency: 800,  quality: 0.88 },
    'gpt-4-turbo':           { costPer1k: 0.01,   baseLatency: 1400, quality: 0.91 },
    'gpt-3.5-turbo':         { costPer1k: 0.002,  baseLatency: 400,  quality: 0.82 },
    'claude-sonnet-4-20250514': { costPer1k: 0.025, baseLatency: 950,  quality: 0.92 },
    'claude-haiku-4-20250414':  { costPer1k: 0.008, baseLatency: 500,  quality: 0.85 },
    'o1-preview':            { costPer1k: 0.06,   baseLatency: 2000, quality: 0.95 },
    'o1-mini':               { costPer1k: 0.012,  baseLatency: 600,  quality: 0.86 },
    'gemini-pro':            { costPer1k: 0.01,   baseLatency: 1100, quality: 0.89 },
    'gemini-1.5-pro':        { costPer1k: 0.02,   baseLatency: 1000, quality: 0.90 },
    'gemini-1.5-flash':      { costPer1k: 0.005,  baseLatency: 350,  quality: 0.83 },
  };

  const fallback = { costPer1k: 0.01, baseLatency: 800, quality: 0.85 };

  return async (task: Task, model: string) => {
    const profile = modelProfiles[model] ?? fallback;
    // Add ±15 % jitter
    const jitter = () => 0.85 + Math.random() * 0.3;
    const inputTokens  = Math.round((50 + task.prompt.length / 4) * jitter());
    const outputTokens = Math.round((100 + task.prompt.length / 2) * jitter());
    const cost = ((inputTokens + outputTokens) / 1000) * profile.costPer1k * jitter();
    // Simulate latency
    await new Promise(r => setTimeout(r, Math.round(profile.baseLatency * 0.01 * jitter())));
    return {
      output: `[mock ${model}] Response to: ${task.prompt.slice(0, 80)}`,
      inputTokens,
      outputTokens,
      cost,
    };
  };
}

const SAMPLE_EXPERIMENT = {
  name: 'code-generation-comparison',
  task: {
    prompt: 'Write a TypeScript function that validates email addresses',
    inputFiles: [],
    evaluator: 'test-pass-rate',
  },
  models: ['gpt-4o', 'claude-sonnet-4-20250514', 'gpt-3.5-turbo'],
  repetitions: 3,
  budget: {
    maxPerRun: 5000,
    maxTotal: 50000,
  },
};

function printUsage(): void {
  console.log(`
squad-ab-test — Multi-Model A/B Testing CLI

Usage:
  squad-ab-test run <experiment.json>   Run an experiment
  squad-ab-test init                    Create a sample experiment.json
  squad-ab-test --help                  Show this help

Options for 'run':
  --concurrency <n>   Max parallel model runs (default: 3)
  --output <dir>      Save JSON results to <dir>

Examples:
  squad-ab-test init
  squad-ab-test run experiment.json
  squad-ab-test run experiment.json --concurrency 5 --output results/
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const command = args[0];

  if (command === 'init') {
    const dest = args[1] ?? 'experiment.json';
    if (fs.existsSync(dest)) {
      console.error(`Error: ${dest} already exists. Remove it first or choose a different name.`);
      process.exit(1);
    }
    fs.writeFileSync(dest, JSON.stringify(SAMPLE_EXPERIMENT, null, 2) + '\n');
    console.log(`Created ${dest} — edit it, then run:\n  squad-ab-test run ${dest}`);
    process.exit(0);
  }

  if (command === 'run') {
    const configPath = args[1];
    if (!configPath) {
      console.error('Error: missing config path. Usage: squad-ab-test run <experiment.json>');
      process.exit(1);
    }
    if (!fs.existsSync(configPath)) {
      console.error(`Error: file not found: ${configPath}`);
      process.exit(1);
    }

    let concurrency = 3;
    let outputDir: string | undefined;

    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--concurrency' && args[i + 1]) {
        concurrency = parseInt(args[++i], 10);
      } else if (args[i] === '--output' && args[i + 1]) {
        outputDir = args[++i];
      }
    }

    console.log(`Running experiment from ${configPath} (concurrency=${concurrency})...\n`);

    const result = await runExperiment(configPath, {
      executor: createMockExecutor(),
      storagePath: outputDir,
      maxConcurrent: concurrency,
    });

    console.log(result.output);
    process.exit(result.exitCode);
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

main();
