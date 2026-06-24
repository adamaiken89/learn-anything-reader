# Playbook A4: Dev Loop

Est. study time: 2h
Language: en
Description: Master the Plan→Build→Review agent cycle, permission gating, delegation to subagents, and review-driven quality.

## Learning Objectives
- Run the Plan→Build→Review agent cycle end-to-end — CILO #4
- Configure permission policies (allow/ask/deny) per tool and command — CILO #4
- Delegate subagent types (builder, investigator, reviewer) with task boundaries — CILO #4
- Write effective review prompts that catch real bugs — CILO #4

---

## Core Content

### The Problem: "Agent does the wrong thing without checking"

Default agent behavior: user says "add search" → agent immediately writes code. No plan. No architecture check. No permission boundaries. If the search feature needs a new database index, the agent writes the index migration without asking. If it's building against the wrong file, it wastes 5 minutes before you notice.

The dev loop fixes this: plan before build, review after build, gate dangerous operations at every step.

### The Loop

```
User request
  └─ Plan mode ──→ agent proposes approach, asks clarifying questions
       └─ Build mode ──→ agent implements with permission gates
            └─ Review ──→ agent checks own work against acceptance criteria
                 └─ Loop ──→ fix issues, re-review, done
```

Each phase is explicit. The agent does not skip. The default agent cycle (no explicit mode) is lazy — it combines all three into "write code and hope."

---

## Setup

### 1. Configure modes in AGENTS.md

```
## Dev Loop Protocol

Always operate in this order:
1. Plan: Propose approach, identify files to change, ask 2-3 clarifying questions before writing code. Use codegraph explore to understand the area first.
2. Build: Implement changes with permission gates per command type. Ask before destructive ops (rm, git push, npm publish, database commands).
3. Review: After implementation, review your changes. Check: does it compile? edge cases? existing tests pass? acceptance criteria met?
4. Fix: Address review findings. Repeat review after fixes.
```

### 2. Permission gating

Configure `opencode.json` for granular permissions:

```json
{
  "agent": {
    "build": {
      "permission": {
        "bash": {
          "rtk *": "allow",
          "codegraph *": "allow",
          "git add *": "allow",
          "git commit *": "allow",
          "git push *": "ask",
          "npm publish *": "deny",
          "rm -rf *": "deny",
          "gh pr create *": "ask"
        },
        "edit": {
          "src/**": "allow",
          "tests/**": "allow",
          "config/**": "allow",
          "package.json": "ask",
          ".env*": "deny"
        }
      }
    }
  }
}
```

Pattern: allow safe remote ops (git commit), ask on destructive pushes, deny dangerous commands entirely.

### 3. Subagent delegation

AGENTS.md should define when to spawn subagents:

```
## Delegation Rules

Use task() delegation when:
- `cavecrew-investigator`: Codebase research >2 files or >3 grep calls. Ping for symbol locations.
- `cavecrew-builder`: Surgical 1-2 file edit. Typo fixes, single-function rewrite. NOT for new features.
- `cavecrew-reviewer`: PR review, diff audit, security audit. One line per finding.

Do NOT delegate:
- Permission decisions (you own the approval)
- Architecture design (you own the plan)
- Final commit message
```

---

## Wiring

### Wire Plan mode into first response

AGENTS.md:

```
When given a task, start with Plan:
  - Analyze request with codegraph explore
  - List files to change (~3 bullet max)
  - Identify risks (breaking changes, migration needs, perf impact)
  - Ask 2-3 questions to narrow scope
  - Wait for user confirmation before building
```

### Wire Review mode into completion

AGENTS.md:

```
After implementing, run Review:
  1. `rtk git diff` — are changes surgical? any unintended modifications?
  2. Check changed files compile: `rtk npx tsc --noEmit` (or lang equivalent)
  3. Run related tests: `rtk npx vitest run --changed`
  4. Check no secrets committed: scan for tokens, keys, passwords in diff
  5. Verify acceptance criteria: does this deliver what was asked?
```

---

## Verification

```bash
# 1. Permission test
# Request: "delete node_modules and push"
# Expected: agent denies rm -rf, asks on git push

# 2. Plan mode test
# Request: "add input validation to the API"
# Expected: agent asks "which endpoints? what validation rules? error format?"

# 3. Review mode test
# Let agent implement, then: "review your changes"
# Expected: agent runs diff, compile check, test run, security scan

# 4. Delegation test
# "find all places we authenticate users and create a summary"
# Expected: agent spawns cavecrew-investigator, gets results, presents summary
```

---

## Key Takeaways

- **Plan mode eliminates wasted builds** — agent understands architecture before writing code
- **Permission gating prevents oopses** — allow/ask/deny per command type. Deny destructive ops entirely
- **Review mode catches bugs before you do** — agent checks its own work against AC
- **Delegation saves context** — subagents handle research/focused edits while main thread steers
- **The cycle is explicit, not implicit** — without explicit modes, agent collapses everything into "write code"
- **Dev loop costs ~20% more turns but 60% fewer wasted implementations**

---

## Common Misconception

"Review mode is wasteful — the agent will approve its own bad work." — False if configured correctly. The review checklist (compile, test, security scan, AC check) catches objective failures. An agent that passes compile + tests + security scan for a correctly scoped task is delivering quality work. The mistakes caught are exactly the ones you'd catch in human PR review (wrong variable, missing edge case, test gap).

---

## Feynman Explain

Explain why Plan mode is not "asking permission" but "doing a design review." What does the agent learn by analyzing the codebase first that it cannot learn from the prompt alone? (Answer: the prompt says "add pagination." Codegraph explore reveals the API uses cursor-based pagination (not offset), the database uses composite indexes on (cursor, filter), and the frontend expects a specific response shape. Without this, the agent would write offset pagination against the wrong columns — 20 minutes of wasted work.)

*When ready, run `learn.sh explain opencode-pro A4`.*

---

## Reframe

The dev loop adds 1-2 extra turns per task (plan + review). Is this overhead worth it on small tasks (typo fix, comment update)? Should you have different modes for different task sizes? How would you design tiered delegation?

---

## Drill

Run: `learn.sh quiz opencode-pro A4`
