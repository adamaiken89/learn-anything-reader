# Playbook C4: Failure Learning

Est. study time: 2h
Language: en
Description: Mine failed sessions for patterns, auto-update AGENTS.md with lessons learned, build continuous improvement loop so harness gets better every week.

## Learning Objectives
- Mine agent session logs for failure patterns — CILO #10
- Auto-generate AGENTS.md rules from failure analysis — CILO #10
- Wire headroom learn to auto-tune compression based on session outcomes — CILO #10
- Build continuous improvement feedback loop — CILO #10

---

## Core Content

### The Problem: "The agent makes the same mistakes every session"

Every session: agent uses wrong API → you correct it → next session, same mistake. Agent writes unsafe code → you catch in review → next session, same pattern.

Without a feedback loop, every mistake is a one-off. AGENTS.md never improves. The harness never adapts.

Failure learning mines session logs for patterns, generates new rules, and updates AGENTS.md automatically. Over weeks, the harness converges: mistakes that happened twice never happen again.

### The Learning Loop

```
Session Logs
  └─ headroom learn --session-mining
      ├─ Pattern detection: "agent used wrong import path 5 times"
      ├─ Score: frequency + severity
      └─ Rule generation: "Always import from @app/shared not @shared"

AGENTS.md (updated)
  └─ New rules added automatically
      └─ Next session: agent reads updated rules
          └─ Mistake not repeated
              └─ Cycle repeats next week
```

---

## Setup

### 1. Enable session logging

```opencode.json
{
  "logging": {
    "level": "info",
    "session": {
      "directory": ".opencode/sessions/",
      "retention": "90d",
      "include-full-context": false
    }
  }
}
```

### 2. Run session mining

```bash
# Analyze last 30 days of sessions
headroom learn --session-mining --days 30 --output .opencode/learnings/
```

Output: patterns.json (detected patterns with frequency/severity), rules.md (generated AGENTS.md rules), efficacy.md (which previous rules are working).

### 3. Preview generated rules

```bash
cat .opencode/learnings/rules.md
# Generated AGENTS.md rules:
# - "Always use --no-verify on git hooks when prototyping" (severity: medium, frequency: 12)
# - "Import from @app/shared not @shared" (severity: high, frequency: 5)
# - "Wrap error responses in ApiError type" (severity: high, frequency: 8)
```

---

## Wiring

### Wire auto-apply

```bash
# Review and apply generated rules
headroom learn --apply --confirm-threshold 0.8
```

This merges high-confidence rules into AGENTS.md automatically. Lower-confidence rules are presented for manual review.

### Wire weekly learning schedule

```yaml
# opencode-scheduler.yaml
jobs:
  session-mining:
    schedule: "0 6 * * 1"  # Monday 6am
    command: "headroom learn --session-mining --days 7 --apply --confirm-threshold 0.8"
    output: ".opencode/learnings/weekly-report.md"
```

Every Monday: mine week's sessions, generate rules, update AGENTS.md, produce weekly report.

### Wire headroom verbosity learning

```bash
headroom learn --verbosity --apply
```

This reads past sessions to detect your preferred compression level. If you often expanded compressed output, it dials compression down. If you never expanded, it compresses more aggressively. The harness adapts to your tolerance.

---

## Verification

```bash
# 1. Session mining finds patterns
headroom learn --session-mining --days 30
# Expected: "Found 3 patterns. 2 high-severity. 1 medium-severity."

# 2. Rules generated
cat .opencode/learnings/rules.md
# Expected: actionable rules ready to add to AGENTS.md

# 3. Auto-apply updates AGENTS.md
headroom learn --apply --confirm-threshold 0.8
# Expected: AGENTS.md updated with new rules

# 4. One week later
headroom learn --efficacy
# Expected: "Rule 'import from @app/shared not @shared' — violations before: 5, after: 0 ✓"

# 5. Verbosity learning
headroom learn --verbosity
# Expected: "Current verbosity score: 74/100. Total sessions analyzed: 124."
```

---

## Key Takeaways

- **Session mining extracts failure patterns** — wrong imports, unsafe patterns, repeated corrections
- **Auto-generated rules update AGENTS.md** — lessons persist across sessions
- **Auto-apply with threshold** — high-confidence rules go live automatically, low-confidence wait for review
- **Weekly learning cycle** — schedule session mining as recurring maintenance task
- **Efficacy tracking** — verify rules actually changed behavior (violations before vs after)
- **Verbosity learning** — compression adapts to your tolerance over weeks
- **If you correct the agent twice, a rule should exist** — failure learning closes the loop

---

## Common Misconception

"AGENTS.md should only be written by humans — letting the AI update it is dangerous." — High-confidence rules (>0.8 threshold) are patterns the agent repeated 5+ times despite existing rules. Adding a rule to prevent a recurring mistake is the definition of "learn from experience." Low-confidence rules are flagged for human review. The threshold is configurable per team. AGENTS.md grows organically from real failures, not theoretical scenarios.

---

## Feynman Explain

Explain why checking efficacy (violations before vs after a rule) is essential for the learning loop, not just nice-to-have. (Answer: without efficacy tracking, you don't know if rules work. Maybe the violation was a fluke. Maybe the rule is too narrow. Maybe a lib upgrade fixed the root cause. Efficacy tells you: 'this rule stopped 5 violations → keep it' or 'violations unchanged → this rule is not being read by the agent → fix format or position in AGENTS.md.')

*When ready, run `learn.sh explain opencode-pro C4`.*

---

## Reframe

Automatic AGENTS.md updates mean the agent's behavior drifts over time based on what it learns from sessions. Is this desirable? What guardrails would you add to prevent the agent from optimizing for the wrong thing (e.g., over-constraining itself)?

---

## Drill

Run: `learn.sh quiz opencode-pro C4`
