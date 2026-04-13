# Quickstart Guide: A/B Testing Framework

Get up and running with model comparison in 5 minutes.

## Prerequisites

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **npm 9+**: Included with Node.js
- **Squad SDK**: This framework builds on the Squad SDK (installed via package.json)

Verify your setup:
```bash
node --version  # v18.0.0 or higher
npm --version   # 9.0.0 or higher
```

## Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd project-squad-sdk-example-ab-testing

# Install dependencies
npm install
```

Expected output:
```
added XX packages in Xs
```

### 2. Build the Project

```bash
npm run build
```

Expected output:
```
# Compiles TypeScript files to dist/ directory
# No errors if successful
```

### 3. Verify Installation

```bash
npm run test
```

Expected output:
```
✓ PASS test/ (XX tests passed)
```

## Your First Experiment

### Step 1: Create an Experiment Config

Create a new file called `my-experiment.json`:

```json
{
  "name": "text-summarization",
  "task": {
    "prompt": "Summarize this text in 2-3 sentences: 'The Squad framework enables teams to build AI-powered applications using the power of multiple models working together. It provides abstraction over model differences, enabling teams to easily swap models and compare their outputs.'",
    "inputFiles": [],
    "evaluator": "test-pass-rate"
  },
  "models": ["gpt-4o", "claude-sonnet-4-20250514", "gpt-3.5-turbo"],
  "repetitions": 2,
  "budget": {
    "maxPerRun": 2000,
    "maxTotal": 20000
  }
}
```

### Step 2: Run the Experiment

```bash
# Build first, then run via compiled output
npm run build

node -e "
const { runExperiment } = require('./dist/cli/runExperiment.js');

const options = {
  maxConcurrent: 3
};

runExperiment('./my-experiment.json', options).then(result => {
  console.log(result.output);
  process.exit(result.exitCode);
});
"
```

### Step 3: Review Results

Expected output (results table):

```
================================================================================
A/B Test Results: text-summarization
Repetitions: 2
Run Date: 2024-01-15T10:30:00Z
================================================================================

Model             Avg Cost ($)  Avg Latency (ms)  Quality Score  StdDev
─────────────────────────────────────────────────────────────────────────
gpt-4o            0.0045        1250              0.95           0.03
claude-sonnet-4   0.0038        980               0.92           0.05
gpt-3.5-turbo     0.0012        450               0.87           0.08

Recommendations:
  ✓ Best Quality:  gpt-4o (0.95)
  ⚡ Fastest:      gpt-3.5-turbo (450ms)
  💰 Cheapest:     gpt-3.5-turbo ($0.0012)

================================================================================
```

## Experiment Configuration Explained

### Task Definition

The `task` object tells the framework what to run:

```json
"task": {
  "prompt": "Your task prompt here",
  "inputFiles": [
    "path/to/document.txt",
    "path/to/code.ts"
  ],
  "evaluator": "test-pass-rate"
}
```

- **prompt**: The instruction to send to each model
- **inputFiles**: Optional context files (paths are relative to config file location)
- **evaluator**: How to assess quality:
  - `test-pass-rate` - Counts passing unit tests in generated code
  - `lint-score` - Runs linter and returns pass/fail score
  - Custom evaluators can be registered programmatically

### Models

List any models available in the Squad SDK:

```json
"models": ["gpt-4o", "claude-sonnet-4-20250514", "gpt-3.5-turbo"]
```

Each model runs independently with the same task.

### Repetitions

Run each model N times to collect statistical data:

```json
"repetitions": 3
```

More repetitions = more reliable results (but higher cost/time).

### Budget

Optionally set token and cost limits:

```json
"budget": {
  "maxPerRun": 5000,
  "maxTotal": 50000
}
```

- `maxPerRun`: Tokens allowed per single model run
- `maxTotal`: Total tokens across all runs

## Advanced Usage

### Custom Evaluators

Register a custom evaluator in your code:

```typescript
import { EvaluatorRegistry } from './src/evaluators/EvaluatorRegistry.js';

const registry = EvaluatorRegistry.getInstance();

registry.register('my-custom-eval', async (output: string) => {
  // Your evaluation logic
  const score = evaluateResponse(output);
  return { score, details: `Evaluated: ${output.length} chars` };
});
```

Then reference it in your config:

```json
"evaluator": "my-custom-eval"
```

### Programmatic API

Run experiments directly in your code:

```typescript
import { runExperiment } from './src/cli/runExperiment.js';
import { AgentExecutor } from './src/agent/AgentSpawner.js';

const executor = new AgentExecutor(/* squad config */);

const result = await runExperiment('./config.json', {
  executor,
  maxConcurrent: 5,
  storagePath: '.squad/experiments'
});

console.log(result.output);
```

### Analyzing Results

Results are stored as JSON for downstream analysis:

```json
{
  "experimentName": "text-summarization",
  "timestamp": "2024-01-15T10:30:00Z",
  "runs": [
    {
      "model": "gpt-4",
      "repetition": 1,
      "tokens": { "input": 150, "output": 80 },
      "cost": 0.0045,
      "latency_ms": 1250,
      "quality_score": 0.95,
      "output": "Generated text..."
    }
  ],
  "aggregates": [
    {
      "model": "gpt-4",
      "avg_cost": 0.0045,
      "avg_latency_ms": 1250,
      "quality_score": 0.95,
      "quality_stddev": 0.03
    }
  ]
}
```

## Common Tasks

### Compare just 2 models

```json
{
  "name": "gpt4-vs-claude",
  "models": ["gpt-4o", "claude-sonnet-4-20250514"],
  "repetitions": 3,
  "task": { ... }
}
```

### Run a quick test (fewer repetitions)

```json
{
  "repetitions": 1
}
```

### Test with stricter evaluation

Use a custom evaluator that has higher standards:

```json
{
  "evaluator": "strict-test-pass-rate"
}
```

### Compare model cost vs quality trade-off

Run with `repetitions: 5` or higher and review the results table. Look for:
- **Best value**: Low cost + acceptable quality
- **Best quality**: Highest score regardless of cost
- **Best speed**: Lowest latency

## Troubleshooting

### "Config validation failed: unknown model 'xyz'"

The model name isn't recognized by the Squad SDK. Check available models:

```bash
# List available models
npm run build && node -e "console.log(require('./dist/index.js').MODELS)"
```

### "Evaluator 'xyz' not registered"

The evaluator name doesn't exist. Options:
1. Use a built-in: `test-pass-rate` or `lint-score`
2. Register a custom evaluator before running the experiment
3. Check spelling in the config file

### "Budget exceeded"

Your experiment ran out of tokens. Options:
1. Reduce `repetitions`
2. Increase `budget.maxTotal`
3. Use cheaper models
4. Make the task simpler (shorter prompt)

### Tests failing after setup

Ensure you have the latest Squad SDK:

```bash
npm install @bradygaster/squad-sdk@latest
npm run build
npm run test
```

## Next Steps

1. **Try different models**: Edit `my-experiment.json` and add more models to compare
2. **Create custom evaluators**: Implement domain-specific quality metrics
3. **Automate with CI/CD**: Schedule regular experiment runs to track model performance over time
4. **Statistical analysis**: Use the confidence intervals to make statistically sound decisions
5. **Read the README**: See [README.md](./README.md) for full architecture and API documentation

## Getting Help

- Check [README.md](./README.md) for architecture and module documentation
- Review example configs in the `test/fixtures/` directory
- Run tests to understand expected behavior: `npm run test`
- Check the PLAN.md for implementation phases and feature details
