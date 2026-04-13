# Quickstart: A/B Testing Framework

Get up and running in 5 minutes. Zero code writing—just configuration.

## Prerequisites

- **Node.js 18+** ([download](https://nodejs.org/))
- **npm 9+** (included with Node.js)

Verify:
```bash
node --version && npm --version
```

## Setup

### Step 0: Install and Build

```bash
npm install && npm run build
npm link    # makes squad-ab-test available as a CLI command
```

Verify everything works:
```bash
npm run test
```

Expected: All tests pass (✓).

## Your First A/B Test

### Step 1: Create experiment.json

```bash
squad-ab-test init
```

This creates `experiment.json` with a sample config. Open it and customize:

```json
{
  "name": "text-summarization-test",
  "task": {
    "prompt": "Summarize this in 2 sentences: 'The Squad framework enables AI teams to build applications using multiple models together, with abstraction over model differences.'",
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

**What this config does:**
- **name**: Gives your experiment a label
- **task.prompt**: The instruction to send to each model
- **models**: List of models to compare (can be 2, 3, or more)
- **repetitions**: Run each model 2 times to get average metrics
- **evaluator**: Use built-in quality checker (`test-pass-rate` or `lint-score`)

### Step 2: Run the Experiment

```bash
squad-ab-test run experiment.json
```

Wait for completion (~1-2 sec for mock models).

### Step 3: Read the Results

Output shows a comparison table:

```
Experiment: text-summarization-test
Date: 2025-01-15T10:30:00.000Z
N=2 repetitions

Model               | Avg Cost    | Avg Latency   | Quality   | Stddev
------------------------------------------------------------------------
gpt-4o              | 0.0045      | 1250ms        | 0.950     | 0.030
claude-sonnet-4     | 0.0038      | 980ms         | 0.920     | 0.050
gpt-3.5-turbo       | 0.0012      | 450ms         | 0.870     | 0.080
```

**What each column means:**
- **Avg Cost**: Average expense per run (lower = cheaper)
- **Avg Latency**: Average response time (lower = faster)
- **Quality**: Evaluator result 0–1 (higher = better)
- **Stddev**: Consistency (lower = more predictable)

### Step 4: Compare & Choose

Use the results to answer:

1. **Best overall?** Look at the model with highest Quality score
2. **Cost vs. quality?** Compare Cost column vs. Quality
3. **Speed matters?** Pick the model with lowest latency
4. **Consistent?** Models with low Stddev are more reliable

## Common Tweaks

### Test Only 2 Models

```json
{
  "models": ["gpt-4o", "claude-sonnet-4-20250514"],
  "repetitions": 3
}
```

### Quick Test (1 run per model)

```json
{
  "repetitions": 1
}
```

### More Accurate Results (Higher Repetitions)

```json
{
  "repetitions": 5
}
```

**Tradeoff:** More repetitions = more accurate but higher cost/time.

### Different Evaluator

```json
{
  "evaluator": "lint-score"
}
```

Available built-ins: `test-pass-rate`, `lint-score`

### Include Context Files

```json
{
  "task": {
    "prompt": "Review this code and suggest improvements",
    "inputFiles": ["src/utils.ts", "src/index.ts"],
    "evaluator": "lint-score"
  }
}
```

Paths are relative to the config file location.

### Set Budget Limits

```json
{
  "budget": {
    "maxPerRun": 3000,
    "maxTotal": 30000
  }
}
```

Experiment stops if limits are exceeded.

### Save Results to Disk

```bash
squad-ab-test run experiment.json --output results/
```

Results are saved as JSON for further analysis.

## What Happens During a Run

1. ✅ Config loads and validates
2. ✅ Framework spawns agents for each model in parallel
3. ✅ Each agent runs your task and collects tokens/latency
4. ✅ Evaluator scores the output (0–1)
5. ✅ Metrics are aggregated (averages, stddev, etc.)
6. ✅ Table results are printed

## Troubleshooting

### Config validation failed

**Error:** `"Config validation failed: unknown field 'xyz'"`

**Fix:** Check JSON syntax. Required fields: `name`, `task`, `models`, `repetitions`.

### Evaluator not found

**Error:** `"Evaluator 'my-eval' not registered"`

**Fix:** Use a built-in: `test-pass-rate` or `lint-score`.

### Tests fail after setup

**Fix:**
```bash
npm install @bradygaster/squad-sdk@latest
npm run build
npm run test
```

### Results seem off

**Possible causes:**
- Only 1 repetition (increase `repetitions` to 3+)
- Evaluator doesn't match task (e.g., using `test-pass-rate` for non-code tasks)
- Budget limits hit (check logs for "Budget exceeded")

## Next Steps

1. **Try different models** — Edit `experiment.json`, add more models
2. **Test your own task** — Change the `prompt` to something real
3. **Increase repetitions** — More runs = more reliable averages
4. **Read [README.md](./README.md)** — For architecture, custom evaluators, and programmatic API
5. **Schedule runs** — Use cron or CI to regularly compare models

## File Locations

- **Config files:** Put `.json` files anywhere you like
- **Results:** Saved to specified `--output` directory with JSON format
- **Source code:** All framework logic in `src/`
- **Tests:** `test/` directory shows usage examples

## Getting Help

```bash
squad-ab-test --help
```

- **Config questions:** See README.md "Configuration" section
- **Custom evaluators:** See README.md "Adding Custom Evaluators"
- **Programmatic API:** See README.md "Programmatic API"
- **Run tests:** `npm run test` shows expected behavior
