# Multi-Model A/B Testing Framework

This framework lets you systematically compare AI model performance by running identical tasks across models, collecting metrics (quality, cost, speed), and getting data-driven recommendations. Define experiments as JSON—no code required—and run side-by-side comparisons to choose the best model for your use case.

## Using This Example

### 1. Install

```bash
npm install
npm run build
npm link          # makes "squad-ab-test" available globally
```

### 2. Create an Experiment Config

```bash
squad-ab-test init              # creates experiment.json
```

Or copy `examples/experiment.json` and edit it. The config format:

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

**Config Fields:**
- **name**: Unique identifier for this experiment
- **task.prompt**: Instruction/prompt to send to each model
- **task.inputFiles**: Optional context files (relative paths)
- **task.evaluator**: Quality metric (`test-pass-rate`, `lint-score`, or custom)
- **models**: List of models to compare
- **repetitions**: How many times to run each model
- **budget**: Optional token/cost limits

### 3. Run the Experiment

```bash
squad-ab-test run experiment.json
```

Options:
```bash
squad-ab-test run experiment.json --concurrency 5
squad-ab-test run experiment.json --output results/
```

### 4. Read the Results Table

The output shows side-by-side comparison:

```
Experiment: code-generation-comparison
Date: 2025-01-15T10:30:00.000Z
N=3 repetitions

Model               | Avg Cost    | Avg Latency   | Quality   | Stddev
------------------------------------------------------------------------
gpt-4o              | 0.0045      | 1250ms        | 0.950     | 0.030
claude-sonnet-4     | 0.0038      | 980ms         | 0.920     | 0.050
gpt-3.5-turbo       | 0.0012      | 450ms         | 0.870     | 0.080
```

**Columns explained:**
- **Avg Cost**: Average token cost per run
- **Avg Latency**: Average response time
- **Quality**: Evaluator result (0–1 scale)
- **Stddev**: Standard deviation across repetitions

Results are also saved as JSON when using `--output`.

## Extending This Example

### Adding Custom Evaluators

Register an evaluator to define custom quality metrics:

```typescript
import { EvaluatorRegistry } from './src/evaluators/EvaluatorRegistry.js';

const registry = new EvaluatorRegistry();

registry.register('my-eval', async (output: string) => {
  const score = calculateQuality(output);  // Your logic — return 0–1
  return score;
});
```

Then reference it in config:

```json
{
  "evaluator": "my-eval"
}
```

### Integrating with Real Model APIs

The framework uses mocked models for testing. To integrate real APIs (OpenAI, Anthropic, etc.):

1. **Update `src/agent/AgentSpawner.ts`** to call real model endpoints
2. **Add API credentials** to environment variables
3. **Implement cost tracking** using your model's pricing

Example pseudo-code:

```typescript
// src/agent/AgentSpawner.ts
async function executeAgent(prompt, model) {
  if (model === 'gpt-4o') {
    return callOpenAI(prompt, { model: 'gpt-4o' });
  } else if (model === 'claude-sonnet-4-20250514') {
    return callAnthropic(prompt, { model: 'claude-sonnet-4-20250514' });
  }
}
```

### Programmatic API

Use the framework directly in TypeScript:

```typescript
import { ConfigParser } from './src/config/ConfigParser.js';
import { Orchestrator } from './src/orchestration/Orchestrator.js';
import { Reporter } from './src/reporting/Reporter.js';
import { AgentExecutor } from './src/agent/AgentSpawner.js';

// Orchestrator requires an executor function
const executor: AgentExecutor = async (task, model) => {
  // Call your model API here
  return { output: '...', inputTokens: 100, outputTokens: 200, cost: 0.01 };
};

const parser = new ConfigParser();
const config = parser.parse(fs.readFileSync('./config.json', 'utf-8'));
const orchestrator = new Orchestrator(executor, { maxConcurrent: 5 });
const result = await orchestrator.run(config);
const reporter = new Reporter();
console.log(reporter.formatTable(result));
```

### Architecture Overview

```
1. Config File (JSON)
         ↓
2. ConfigParser → Validates schema, loads files
         ↓
3. Orchestrator → Spawns agents in parallel
         ↓
4. AgentSpawner → Calls models, collects tokens/latency
         ↓
5. Evaluator → Runs quality check on output
         ↓
6. Metrics Aggregator → Computes avg, stddev, confidence intervals
         ↓
7. Reporter → Generates results table & recommendations
         ↓
8. Storage → Persists JSON results for analysis
```

## Project Structure

```
src/
├── cli/              # CLI entry point (runExperiment)
├── config/           # JSON config parsing
├── validators/       # Config validation rules
├── types/            # TypeScript interfaces
├── task/             # Task definition & context building
├── evaluators/       # Quality evaluators (registry + built-ins)
├── agent/            # Agent execution (model calls)
├── orchestration/    # Parallel run coordination
├── metrics/          # Metrics collection & aggregation
├── scoring/          # Quality score calculation
├── reporting/        # Results table & JSON export
├── storage/          # Persist results to disk
├── stats/            # Statistical analysis
└── recommendations/  # Model ranking & advice
```

## SDK Modules

| Module | Purpose |
|--------|---------|
| `ConfigParser` | Parse and validate experiment JSON |
| `Orchestrator` | Coordinate parallel model runs |
| `AgentSpawner` | Execute task on a given model |
| `EvaluatorRegistry` | Register/lookup quality evaluators |
| `MetricsCollector` | Gather tokens, latency, cost |
| `Reporter` | Format results as table + JSON |
| `Recommender` | Rank models by cost/quality/speed |

## Testing

```bash
npm run test              # Run all tests
npm run test -- --watch  # Watch mode
npm run build            # Compile TypeScript
```

Tests cover:
- Config validation
- Evaluator registry
- Agent execution
- Metrics calculation
- Statistical analysis
- Reporting and formatting

## Roadmap

- ✅ Config file parsing
- ✅ Parallel orchestration
- ✅ Built-in evaluators (test-pass-rate, lint-score)
- ✅ Metrics collection & aggregation
- ✅ Statistical analysis
- ✅ Results reporting
- 🔄 Real model API integration (OpenAI, Anthropic, etc.)
- 🔄 Squad SDK runtime integration
- 📋 Cost tracking and budgeting
- 📋 Historical run comparison
