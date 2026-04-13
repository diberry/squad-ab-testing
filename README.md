# Multi-Model A/B Testing Framework

A comprehensive framework for systematically comparing AI model performance using the Squad SDK. Run identical tasks across multiple models, collect quality/cost/speed metrics, and get data-driven model selection recommendations.

## What It Does

- **Multi-Model Comparison**: Execute tasks in parallel across any Squad SDK models (GPT-4o, Claude Sonnet, etc.)
- **Automated Evaluation**: Pluggable evaluator system to assess quality (test pass rates, lint scores, custom metrics)
- **Metrics Collection**: Track token usage, cost, latency, and output quality per run
- **Statistical Analysis**: Compute confidence intervals and significance testing for robust comparisons
- **Results Reporting**: Generate human-readable comparison tables and JSON exports
- **Experiment Configuration**: Define experiments via simple JSON config files

## Architecture Overview

```
Config → Parser → Validator
                     ↓
Task Builder → Evaluator Registry
                     ↓
Orchestrator → Agent Spawner (parallel)
                     ↓
Metrics Collector → Metrics Aggregator
                     ↓
Scorer (evaluate quality)
                     ↓
Reporter (results table) → Results Store
```

## SDK Integration Status

> **Note:** This is a standalone framework demonstrating multi-model comparison patterns. It does not currently import or depend on the Squad SDK at runtime. Future versions could integrate with Squad SDK's MODELS catalog and cost-tracker for real agent orchestration.

## SDK Modules (Planned)

| Module | Purpose |
|--------|---------|
| `runtime.MODELS` | Catalog of available models with metadata |
| `runtime.cost-tracker` | Track token consumption and costs per run |
| `builders.defineAgent()` | Create agents with specific model assignments |
| `state.SquadState` | Store experiment results and metrics |

## Project Structure

```
src/
├── cli/                   # CLI entry point (runExperiment command)
├── config/                # Config file parsing
├── validators/            # Config and model validation
├── types/                 # TypeScript interfaces
├── task/                  # Task definition and building
├── evaluators/            # Quality evaluators (registry, built-ins)
├── agent/                 # Agent spawning and execution
├── orchestration/         # Parallel run coordination
├── metrics/               # Metrics collection and aggregation
├── scoring/               # Quality evaluation and scoring
├── reporting/             # Results formatting (table, JSON)
├── storage/               # Results persistence
├── stats/                 # Statistical analysis
└── recommendations/       # Model ranking and recommendations

test/
├── config/                # Config parsing tests
├── evaluators/            # Evaluator registry tests
├── agent/                 # Agent runner tests
├── metrics/               # Metrics collection tests
├── orchestration/         # Orchestrator tests
├── scoring/               # Scorer tests
├── reporting/             # Reporter tests
├── stats/                 # Statistics tests
└── cli/                   # End-to-end CLI tests
```

## Installation

1. **Clone the repository** and navigate to the project directory:
   ```bash
   git clone <repo-url>
   cd project-squad-sdk-example-ab-testing
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

## Testing

```bash
npm run test
```

Runs all unit and integration tests using Vitest.

## Configuration

Experiments are defined using JSON configuration files. Here's an example:

```json
{
  "name": "code-generation-comparison",
  "task": {
    "prompt": "Write a TypeScript function that validates email addresses",
    "inputFiles": [],
    "evaluator": "test-pass-rate"
  },
  "models": ["gpt-4o", "claude-sonnet-4-20250514", "gpt-3.5-turbo"],
  "repetitions": 3,
  "budget": {
    "maxPerRun": 5000,
    "maxTotal": 50000
  }
}
```

### Config Fields

- **name** (string): Unique experiment identifier
- **task** (object):
  - **prompt** (string): The task to run on each model
  - **inputFiles** (string[]): Optional file paths to include in context
  - **evaluator** (string): Evaluator type (`test-pass-rate`, `lint-score`, or custom)
- **models** (string[]): Array of model names to test
- **repetitions** (number): How many times to run each model
- **budget** (object, optional):
  - **maxPerRun**: Token limit per single run
  - **maxTotal**: Total token budget for entire experiment

## Usage

See [QUICKSTART.md](./QUICKSTART.md) for a step-by-step walkthrough of setting up and running your first experiment.

## Key Features

- **Pluggable Evaluators**: Register custom evaluation functions for domain-specific quality metrics
- **Graceful Error Handling**: Continues even if one model fails; marks results appropriately
- **Concurrent Execution**: Respects rate limits while maximizing throughput
- **Historical Tracking**: Store and compare results across multiple experiment runs
- **Statistical Rigor**: Confidence intervals and significance testing for decisions

## Development

The project follows a test-first development approach. Each feature includes:
1. Comprehensive unit tests
2. Integration tests for cross-module workflows
3. Mocked SDK dependencies for isolation

Run tests in watch mode:
```bash
npm run test -- --watch
```

## License

See LICENSE file for details.
