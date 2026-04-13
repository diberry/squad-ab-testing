# Multi-Model A/B Testing Framework — TDD Implementation Plan

## Overview

This project implements a systematic A/B testing framework for the Squad SDK that runs identical tasks across multiple AI models, collects quality/cost/speed metrics, and produces data-driven model selection recommendations.

## SDK Modules Reference

| Module | Capability | Status |
|--------|-----------|--------|
| `runtime.MODELS` | Full model catalog with metadata | ✅ Available |
| `runtime.cost-tracker` | Token consumption and cost per run | ✅ Available |
| `runtime.telemetry` | Emit experiment metrics | ✅ Available |
| `runtime.otel-metrics` | OpenTelemetry experiment counters | ✅ Available |
| `builders.defineAgent()` | Create identical agents with different model assignments | ✅ Available |
| `builders.defineDefaults()` | Set experiment-wide defaults | ✅ Available |
| `state.SquadState` | Store experiment results | ✅ Available |

## Known Gaps (Must Build)

1. **Quality evaluation framework** — SDK provides no evaluator system; must build pluggable evaluator architecture
2. **Experiment config parser** — Parse and validate experiment definition files
3. **Parallel execution orchestrator** — Spawn and manage N concurrent model runs
4. **Metrics aggregator** — Collect per-run data and compute aggregates
5. **Results formatter** — Generate comparison tables and reports
6. **Statistical analysis** — Compute confidence intervals and significance

---

## Phase 1: Core Architecture & Config (P0 Foundation)

### Feature 1.1: Experiment Config Schema

**Test First:**
- `Config.test.ts`: `should parse valid experiment config` — validates structure with models, task, repetitions
- `Config.test.ts`: `should reject config missing required fields` — task, models, or repetitions
- `Config.test.ts`: `should validate model names against SDK catalog` — errors on unknown models
- `Config.test.ts`: `should validate repetitions is positive integer` — rejects 0 or negative values

**Implementation:**
- `src/types/ExperimentConfig.ts` — TypeScript interface for config structure
- `src/config/ConfigParser.ts` — Parse JSON/YAML config files
- `src/validators/ConfigValidator.ts` — Validate against SDK model catalog; throw descriptive errors

---

## Phase 2: Task & Evaluator System (P0 Foundation)

### Feature 2.1: Task Definition

**Test First:**
- `Task.test.ts`: `should create task from config` — accepts prompt, inputFiles, evaluator
- `Task.test.ts`: `should resolve relative file paths` — converts relative paths to absolute
- `Task.test.ts`: `should require evaluator type to be recognized` — validates evaluator exists

**Implementation:**
- `src/types/Task.ts` — Task interface
- `src/task/TaskBuilder.ts` — Build task from config with file resolution

### Feature 2.2: Pluggable Evaluator Framework

**Test First:**
- `Evaluator.test.ts`: `should register a custom evaluator` — add evaluator function to registry
- `Evaluator.test.ts`: `should retrieve evaluator by name` — lookup registered evaluator
- `Evaluator.test.ts`: `should throw on missing evaluator` — errors if evaluator not registered
- `Evaluator.test.ts`: `should run test-pass-rate evaluator on input` — counts passing tests in generated code
- `Evaluator.test.ts`: `should run lint-score evaluator on input` — runs linter, returns pass/fail score

**Implementation:**
- `src/types/Evaluator.ts` — Evaluator interface and registry
- `src/evaluators/EvaluatorRegistry.ts` — Registry implementation
- `src/evaluators/TestPassRateEvaluator.ts` — Built-in evaluator
- `src/evaluators/LintScoreEvaluator.ts` — Built-in evaluator

---

## Phase 3: Agent Spawning & Execution (P0 Core)

### Feature 3.1: Agent Runner

**Test First:**
- `AgentRunner.test.ts`: `should spawn agent with specific model` — creates squad agent with given model override
- `AgentRunner.test.ts`: `should execute agent and capture output` — runs agent and returns generated output
- `AgentRunner.test.ts`: `should capture token usage from agent run` — extracts token counts via cost-tracker
- `AgentRunner.test.ts`: `should capture latency` — measures wall-clock time
- `AgentRunner.test.ts`: `should handle agent timeout` — errors if run exceeds budget time

**Implementation:**
- `src/types/AgentRun.ts` — Result type with model, output, tokens, cost, latency
- `src/agent/AgentSpawner.ts` — Use `builders.defineAgent()` to create agent with model override
- `src/agent/AgentRunner.ts` — Execute agent, collect metrics via cost-tracker + telemetry

### Feature 3.2: Parallel Execution

**Test First:**
- `Orchestrator.test.ts`: `should run task across 3 models in parallel` — executes N agents concurrently
- `Orchestrator.test.ts`: `should respect max concurrent limit` — queues runs if N exceeds limit
- `Orchestrator.test.ts`: `should aggregate results` — collects all runs into ExperimentResult
- `Orchestrator.test.ts`: `should handle partial failures gracefully` — continues if one model fails, marks as error

**Implementation:**
- `src/types/ExperimentResult.ts` — Container for all runs and metrics
- `src/orchestration/Orchestrator.ts` — Manage concurrent agent spawns, queue, aggregation

---

## Phase 4: Metrics & Evaluation (P0 Analysis)

### Feature 4.1: Per-Run Metrics Collection

**Test First:**
- `Metrics.test.ts`: `should collect input/output token counts` — extracts from cost-tracker
- `Metrics.test.ts`: `should compute total cost` — models.cost × tokens
- `Metrics.test.ts`: `should measure latency` — start → finish time
- `Metrics.test.ts`: `should compute output length` — character and line count
- `Metrics.test.ts`: `should tag run with model, repetition number` — metadata for grouping

**Implementation:**
- `src/types/RunMetrics.ts` — Metrics data structure
- `src/metrics/MetricsCollector.ts` — Collect metrics from agent run + cost-tracker
- `src/metrics/MetricsAggregator.ts` — Aggregate across repetitions (mean, min, max)

### Feature 4.2: Evaluation & Scoring

**Test First:**
- `Scorer.test.ts`: `should evaluate run with given evaluator` — calls evaluator function
- `Scorer.test.ts`: `should store evaluation result per run` — quality_score field
- `Scorer.test.ts`: `should handle evaluator errors gracefully` — marks as unevaluated if error
- `Scorer.test.ts`: `should aggregate quality scores across repetitions` — mean, stddev

**Implementation:**
- `src/types/RunQuality.ts` — Quality assessment structure
- `src/scoring/Scorer.ts` — Call evaluator, handle errors
- `src/scoring/QualityAggregator.ts` — Aggregate quality metrics across runs

---

## Phase 5: Results & Reporting (P0 Output)

### Feature 5.1: Results Table

**Test First:**
- `Reporter.test.ts`: `should format results as text table` — columns: model, avg_cost, avg_latency, quality_score, stddev
- `Reporter.test.ts`: `should sort by quality_score descending` — best performers first
- `Reporter.test.ts`: `should include repetitions info in header` — "N=3 repetitions"
- `Reporter.test.ts`: `should include task name and date in report` — metadata header

**Implementation:**
- `src/reporting/Reporter.ts` — Format results table, write to stdout
- `src/reporting/JsonReporter.ts` — Export results as JSON for downstream processing

### Feature 5.2: Results Storage

**Test First:**
- `ResultsStore.test.ts`: `should save experiment results to file` — write JSON to .squad/experiments/
- `ResultsStore.test.ts`: `should load previous results by experiment name` — retrieve historical runs
- `ResultsStore.test.ts`: `should append new results to history` — not overwrite

**Implementation:**
- `src/types/StoredResult.ts` — Persistable result structure with timestamp
- `src/storage/ResultsStore.ts` — Use SDK state or file system to store/retrieve

---

## Phase 6: CLI Integration (P0 CLI)

### Feature 6.1: Run Experiment Command

**Test First:**
- `CLI.test.ts`: `should parse experiment config path argument` — loads and validates config
- `CLI.test.ts`: `should print results table after execution` — end-to-end from config to report
- `CLI.test.ts`: `should exit 0 on success, 1 on error` — proper exit codes

**Implementation:**
- `src/cli/runExperiment.ts` — Entry point for `squad ab-test run <config>`
- Wire all components: config → task → spawn agents → evaluate → report

---

## Phase 7: Statistical Confidence (P1 Enhancement)

### Feature 7.1: Confidence Intervals

**Test First:**
- `Stats.test.ts`: `should compute mean and stddev for metric` — across N repetitions
- `Stats.test.ts`: `should compute 95% confidence interval` — t-distribution for small N
- `Stats.test.ts`: `should report CI in results table` — model ± CI format

**Implementation:**
- `src/stats/StatisticsCalculator.ts` — CI computation using t-distribution

### Feature 7.2: Significance Testing

**Test First:**
- `Stats.test.ts`: `should compare model A vs B` — t-test, p-value
- `Stats.test.ts`: `should flag if difference not significant` — p > 0.05

**Implementation:**
- `src/stats/SignificanceTest.ts` — Pairwise t-tests

---

## Phase 8: Recommendations (P1 Enhancement)

### Feature 8.1: Recommendation Engine

**Test First:**
- `Recommender.test.ts`: `should rank models by quality_score` — highest first
- `Recommender.test.ts`: `should mark fastest model` — min latency
- `Recommender.test.ts`: `should mark cheapest model` — min cost

**Implementation:**
- `src/recommendations/Recommender.ts` — Rank and annotate models

---

## Implementation Order

1. **Phase 1** (Config Schema) → 2 days
2. **Phase 2** (Task + Evaluators) → 3 days
3. **Phase 3** (Agent Spawning) → 3 days
4. **Phase 4** (Metrics) → 2 days
5. **Phase 5** (Results) → 2 days
6. **Phase 6** (CLI) → 2 days
7. **Phase 7** (Stats) → 2 days
8. **Phase 8** (Recommendations) → 1 day

**Total P0: ~17 days | P1: ~5 days**

---

## Directory Structure

```
src/
├── cli/
│   └── runExperiment.ts
├── config/
│   └── ConfigParser.ts
├── validators/
│   └── ConfigValidator.ts
├── task/
│   └── TaskBuilder.ts
├── evaluators/
│   ├── EvaluatorRegistry.ts
│   ├── TestPassRateEvaluator.ts
│   └── LintScoreEvaluator.ts
├── agent/
│   ├── AgentSpawner.ts
│   └── AgentRunner.ts
├── orchestration/
│   └── Orchestrator.ts
├── metrics/
│   ├── MetricsCollector.ts
│   ├── MetricsAggregator.ts
│   └── types.ts
├── scoring/
│   ├── Scorer.ts
│   └── QualityAggregator.ts
├── reporting/
│   ├── Reporter.ts
│   └── JsonReporter.ts
├── storage/
│   └── ResultsStore.ts
├── stats/
│   ├── StatisticsCalculator.ts
│   └── SignificanceTest.ts
├── recommendations/
│   └── Recommender.ts
├── types/
│   ├── ExperimentConfig.ts
│   ├── Task.ts
│   ├── Evaluator.ts
│   ├── AgentRun.ts
│   ├── ExperimentResult.ts
│   ├── RunMetrics.ts
│   └── RunQuality.ts
└── index.ts

test/
├── config/
│   └── Config.test.ts
├── task/
│   └── Task.test.ts
├── evaluators/
│   └── Evaluator.test.ts
├── agent/
│   └── AgentRunner.test.ts
├── orchestration/
│   └── Orchestrator.test.ts
├── metrics/
│   └── Metrics.test.ts
├── scoring/
│   └── Scorer.test.ts
├── reporting/
│   └── Reporter.test.ts
├── storage/
│   └── ResultsStore.test.ts
├── stats/
│   └── Stats.test.ts
├── cli/
│   └── CLI.test.ts
└── recommendations/
    └── Recommender.test.ts
```

---

## Test-First Approach

For each feature:
1. Write test file with describe block and it() stubs (names from this plan)
2. Write implementation to make tests pass
3. Verify all tests pass before moving to next feature
4. Build test mocks for SDK dependencies (MODELS, cost-tracker, etc.)

---

## Success Criteria

✅ All P0 features implemented with passing tests  
✅ Config → Results pipeline works end-to-end  
✅ Results table shows model comparison  
✅ Code builds with `npm run build`  
✅ Tests pass with `npm run test`  
