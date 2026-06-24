# Playbook A2: Token Economy

Est. study time: 2.5h
Language: en
Description: Reduce token consumption 60-95% using rtk command proxy, headroom compression pipeline, cache alignment, and output token reduction. Save $50-200/month per developer.

## Learning Objectives
- Configure rtk with custom aliases and filters for daily commands — CILO #2
- Deploy headroom proxy with all compression algorithms active — CILO #2
- Enable CacheAligner for provider KV cache hits — CILO #2
- Configure output token reduction (verbosity steering + effort routing) — CILO #2
- Measure savings using headroom dashboard and rtk gain — CILO #2

---

## Core Content

### The Problem: "My context fills up in 5 turns"

Every command output, file read, grep result, and error message burns tokens. On expensive models (Sonnet, Opus), output tokens cost 5x input. A single `ls -la` on a project with 500 files can waste 2,000 tokens. A `git log --all` costs 3,000. A test run that prints 2,000 lines destroys 15,000 tokens.

The typical dev burns $50-200/month on noise — output the agent reads once and discards.

### The Stack (compounding savings)

```
rtk ───── command output ─── 60% reduction ──→ slices whitespace, truncates, groups
  └─ headroom (proxy) ────── 60-95% total ──→ JSON flattening, AST summarization, prose compression
       ├─ SmartCrusher       → JSON arrays → compact keys, dedup nulls
       ├─ CodeCompressor     → AST-aware: strip docstrings, minify identifiers
       ├─ Kompress-base      → learned prose compression (HF model)
       ├─ CacheAligner       → stabilizes prompt prefixes so KV caches hit
       └─ Output Token Reduction → "be terse" steering + effort dialing
```

Each layer removes a different kind of waste. Stacked, they compound.

---

## Setup

### 1. rtk deep config

rtk has per-command optimizations. Configure these in `~/.config/rtk/config.json`:

```json
{
  "aliases": {
    "ls": "ls --color=never -F",
    "git": "git --no-pager"
  },
  "drops": {
    "git log": ["--date=relative", "--format=%h %s"]
  },
  "max_lines": 100
}
```

AGENTS.md instruction:

```
Always prefix commands with rtk:
  - rtk ls instead of ls
  - rtk git log --oneline -5 instead of git log
  - rtk find . -name "*.ts" instead of find
  - rtk grep "function" --include="*.ts" instead of grep
Never use raw ls/grep/find/git.
```

### 2. headroom proxy with all algorithms

```bash
# Start proxy with full compression pipeline
headroom proxy --port 8787 \
  --compression all \
  --model kompress-v2-base \
  --cache-align \
  --output-shaper

# Or wrap existing session
headroom wrap opencode
```

Verify with:
```bash
headroom perf
# Expected: 60-95% compression ratio on tool outputs
```

### 3. Cache alignment

CacheAligner rewrites prompts so repeated prefixes (system prompt, AGENTS.md, tool schemas) are byte-identical across turns. Anthropic/OpenAI KV caches only hit on exact prefix matches.

```bash
# Enable in headroom proxy (on by default since v0.24)
export HEADROOM_CACHE_ALIGN=1
```

Without CacheAligner: every tool result slightly shifts prefix bytes → cache miss → full recompute (~$0.03 per miss on Sonnet). With it: KV cache hits for system prompt + AGENTS.md → 40-60% fewer input tokens.

### 4. Output token reduction

LLMs waste output tokens on ceremony ("Great, let me look at that..."), restating code you just showed them, and deep "thinking" on trivial reads.

```bash
export HEADROOM_OUTPUT_SHAPER=1
export HEADROOM_OUTPUT_HOLDOUT=0.1  # 10% control group for measurement
```

This appends a "be terse" note to system prompt (cache-safe position) and dials thinking effort down on routine turns (file reads, passing tests). New questions and errors keep full effort.

Measure savings:
```bash
headroom output-savings
# "Reduction: 31.7% (95% CI 27.7% ... 35.7%) [estimated]"
```

---

## Wiring

### Wire rtk aliases into opencode custom commands

Create `.opencode/commands/` with common rtk shortcuts:

```json
// .opencode/commands/rtk-ls.json
{
  "command": "rtk ls -la",
  "description": "List files with rtk compression"
}
```

### Wire headroom dashboard for live savings

```bash
headroom dashboard
# Opens browser at localhost:8788 with live token savings chart
```

### Wire headroom learn for verbosity tuning

```bash
# Let headroom learn your terseness preference from past sessions
headroom learn --verbosity --apply
```

---

## Verification

```bash
# 1. Measure rtk savings on your own project
# Replace raw ls with rtk ls and compare token count
rtk gain
# Expected: "Total tokens saved: 1,247,892 (72.3% reduction)"

# 2. headroom savings dashboard
headroom dashboard
# Input compression: 78% | Output reduction: 31% (estimated)

# 3. specific example comparison
# Without compression:
ls -la src/ | wc -c
# 4,281 bytes
rtk ls -la src/ | wc -c
# 892 bytes
# 79% reduction from rtk alone

# 4. headroom + rtk together
headroom perf --sample "ls -la src/"
# "rtk: 5,120 → 1,204 tokens (76%) | headroom: 1,204 → 412 tokens (92% total)"
```

---

## Key Takeaways

- **rtk is cheap per-command savings** — no proxy, no config: just prefix commands. 60% reduction.
- **headroom is deep compression** — JSON flattening, AST summarization, learned prose compression. Adds another 50-80% on top of rtk.
- **CacheAligner is free money** — zero compression, pure caching optimization. 40-60% fewer input tokens.
- **Output shaper saves 30% on generation costs** — output tokens cost 5x input on high-end models.
- **Stacked: rtk → headroom → cache → output shaper = 70-95% total reduction.**
- At $0.015/input + $0.075/output (Sonnet), savings = $50-200/month per dev on moderate usage (100M input tokens/month).

---

## Common Misconception

"Compression means the agent will make worse decisions." — Benchmarks show accuracy preserved (GSM8K: ±0.0, TruthfulQA: +3.0). Headroom's CCR makes compression reversible — the agent can call `headroom_retrieve` if it needs original data. For routine navigation (file reads, ls, git log, grep), the compressed version carries all necessary information. The waste is formatting, whitespace, and redundant metadata.

---

## Feynman Explain

Explain why compressing tool output is not "hiding information from the agent." What specific bytes does rtk strip that the agent doesn't need? What does headroom's CodeCompressor extract from a source file that keeps the semantics? (Answer: rtk strips ls colors, git pager formatting, file permissions on `ls -la` — structural ceremony. CodeCompressor uses AST to keep function signatures, types, and control flow while discarding docstrings and whitespace. The agent gets complete semantics in fewer tokens.)

*When ready, run `learn.sh explain opencode-pro A2` — AI will probe for gaps.*

---

## Reframe

If headroom achieves 92% compression with no accuracy loss, should everyone run it by default? What's the counterargument — when would you disable compression? (Think: streaming/debugging where byte-level output matters, or when prompt structure is so tight that compression violates schema expectations.)

---

## Drill

Run: `learn.sh quiz opencode-pro A2`
