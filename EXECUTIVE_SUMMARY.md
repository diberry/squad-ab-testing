# Executive Summary: Multi-Model A/B Testing Framework

## One-Liner
A systematic experimentation framework that runs identical software engineering tasks across AI models, collects quality/cost/speed metrics, and replaces gut-feel model choices with data-driven recommendations.

---

## The Problem
Teams pick AI models based on convention or defaults ("use Claude for code, GPT for docs"), but have zero visibility into actual performance on their specific codebase. With new models shipping monthly and the SDK offering a 16-model catalog, decision-makers lack the evidence needed to optimize for cost, quality, or speed tradeoffs. This leaves teams either overspending on premium models when cheaper alternatives suffice, or undershooting on quality because they don't know which model performs best for their domain.

---

## The Opportunity
The Squad SDK uniquely enables this. Unlike commodity LLM benchmarks (e.g., LMSYS leaderboards testing generic chat), you can systematically evaluate models on **your real tasks**—code generation, test writing, refactoring, documentation—against your own codebase. The SDK's built-in cost tracker reveals per-model pricing and token usage, per-agent model selection means you can override defaults per task, and the 16-model catalog is large enough to find meaningful cost-quality frontiers. No other testing framework lets you benchmark real-world engineering workflows with per-model cost visibility.

---

## Who Benefits

- **Engineering Leads** — Data to justify model selections in squad configs; confidence that you're not overpaying
- **Platform Teams** — Evidence-backed org-wide model policies; "use Model X for code, Model Y for docs" supported by experiments on your codebase
- **Cost-Conscious Teams** — Identify cheaper models that meet your quality bar; track cost savings quarter-over-quarter
- **AI Researchers** — Real-world benchmarking data on software engineering tasks (vs. generic QA datasets)
- **Individual Contributors** — Visibility into which models solve **their specific problems fastest and cheapest**

---

## What You'll Learn
This sample teaches three core SDK patterns:

1. **Multi-Agent Orchestration** — Spawn identical agents with different model overrides in parallel; manage concurrent execution and graceful failures
2. **Cost Tracking & Telemetry** — Extract token consumption and cost data from each run; aggregate metrics across repetitions for statistical confidence
3. **Pluggable Evaluation** — Register custom quality evaluators (test pass rates, lint scores, domain-specific metrics) and compose them into reusable frameworks

---

## Key Differentiator
Generic benchmarks measure models in isolation on synthetic problems. This framework measures **your models on your problems**: Given the actual test files, code architecture, and domain constraints of your codebase, which model generates the most usable tests? Answers vary dramatically by codebase and task. A model that excels at generic code generation may struggle with your test patterns, and a cheap model might be cost-effective for documentation but inadequate for complex refactoring. This is why you need local benchmarking.

---

## Build vs Buy
**Why not use LMSYS or similar public leaderboards?**
- LMSYS tests general knowledge (math, trivia, roleplay) — not your code-generation or test-writing patterns
- Public benchmarks hide cost data — they show speed/quality but not price-per-token
- No per-agent model assignment — you can't use Haiku for docs and Sonnet for code in a single squad
- No historical tracking — you can't see how model performance degraded after a provider update
- No real-codebase context — your domain may be wildly different from public test sets

**Build:** You control the experiment design, evaluators, and cost model. Your data is private. Results are directly actionable in your squad configs.

---

## ROI Signal
Measure success with these concrete outcomes:

1. **Cost Savings from Model Substitution** — "We switched 40% of agent runs from Claude Opus ($15/1M tokens) to Claude Sonnet ($3/1M tokens) with no quality regression; saves $12k/month at our scale"
2. **Reduced Decision Latency** — "Before: 3 weeks of manual testing to evaluate new models. After: 1 hour from model release to ranked results table"
3. **Quality Floor Enforcement** — "We discovered GPT-5.3 failed our test-generation evaluator; experiments prevented promotion to production. Traditional trial-and-error would have shipped it"

---

## Next Steps
- See [QUICKSTART.md](./QUICKSTART.md) for hands-on setup and your first experiment
- Read [PLAN.md](./PLAN.md) for implementation roadmap and architecture details
- Review [README.md](./README.md) for SDK modules and project structure
