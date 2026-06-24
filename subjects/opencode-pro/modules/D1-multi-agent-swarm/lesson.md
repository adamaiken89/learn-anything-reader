# Playbook D1: Multi-Agent Swarm

Est. study time: 2.5h
Language: en
Description: Orchestrate multiple subagents for parallel codebase tasks — investigator finds code, builder edits, reviewer checks. Route tasks, share context, manage delegation.

## Learning Objectives
- Design subagent matrix with specialized types — CILO #11
- Implement task routing decisions (when to delegate, to whom) — CILO #11
- Manage shared context across subagents — CILO #11
- Handle delegation failures and escalations — CILO #11

---

## Core Content

### The Problem: "One agent doing everything is slow and shallow"

The main agent explores 5 files, reads 3, edits 2, and reviews 1 — all sequentially. By the time it reads file 5, it's forgotten file 1's structure. Context is full of dead ends. A refactor that requires changing 8 files takes 30 turns.

Multi-agent swarm: spawn parallel subagents. Investigator reads code while builder edits the known target. Reviewer checks output while you move to the next task. Each subagent has a focused context — small, fast, cheap.

### Swarm Architecture

```
Main Thread (steers)
  ├─ Investigators (read-only) — "explore payment flow, return architecture summary"
  │   └─ Returns structured summary in 1 turn
  ├─ Builders (surgical write) — "fix bug in processPayment.ts"
  │   └─ Returns diff + success/failure in 1-2 turns
  └─ Reviewers (check quality) — "review PR #123, return findings"
      └─ Returns one-line-per-finding severity-tagged output
```

---

## Setup

### 1. Define subagent types in AGENTS.md

```
## Delegation Rules

### cavecrew-investigator
When: research phase (explore >2 files or architecture question)
Task: Read-only. Return file:line table. No suggestions.
Format: `src/auth.ts:42: authenticateUser() — called by src/middleware/auth.ts:15`

### cavecrew-builder
When: surgical 1-2 file edit with clear scope
Task: Edit only. Hard-refuses 3+ file scope.
Format: caveman-diff receipt

### cavecrew-reviewer
When: diff/branch review, security audit, PR review
Task: One line per finding. Severity-tagged.
Format: `path:line: <:warning> medium: edge case. Fix: handle null before dispatch`
```

### 2. Wire routing rules

```
## Task Routing

- Codebase research (>2 files or "how does X work") → investigator
- Bug fix in clear scope (1-2 files) → builder
- Feature with multi-file changes → mark "needs build delegation" during plan phase
- PR/diff review → reviewer
- Do NOT delegate: permission decisions, architecture design, final commit message
```

---

## Wiring

### Wire shared context across subagents

```json
{
  "task": {
    "session": {
      "share-context": true,
      "context-facts": ["architecture-summary", "active-branch", "bug-description"]
    }
  }
}
```

Subagents inherit context facts from the main thread. Builder knows the bug description without re-asking. Investigator knows which part of the architecture to focus on.

### Wire delegation failure handling

AGENTS.md:

```
## Delegation Failures

If a subagent fails:
  1. Capture the error message
  2. If investigator fails: fallback to codegraph explore directly
  3. If builder fails: re-prompt with clearer scope boundaries
  4. If reviewer fails: fallback to manual review checklist
  5. If all 3 fail for the same task: report "Cannot delegate — manual intervention required"
```

---

## Verification

```bash
# 1. Investigator delegation
# Prompt: "explore the auth module and return architecture summary"
# Expected: investigator spawns, explores 3-5 files, returns file:line table

# 2. Builder delegation
# Prompt: "fix the null reference in processPayment.ts:45"
# Expected: builder reads code at line 45, edits, returns diff receipt

# 3. Reviewer delegation
# Prompt: "review my uncommitted changes"
# Expected: reviewer analyzes diff, returns severity-tagged findings

# 4. Parallel delegation
# Prompt: "explore the cart system while I fix the checkout bug"
# Expected: investigator explores cart, builder fixes checkout, both run concurrently
```

---

## Key Takeaways

- **Specialized subagents are faster than one general agent** — focused context = cheap turns
- **Investigator reads and returns structured data** — no opinions, no suggestions
- **Builder edits surgically within clear scope** — hard-refuses scope creep
- **Reviewer catches issues main thread misses** — fresh perspective on the same code
- **Shared context facts prevent re-explaining** — subagents inherit what main thread learned
- **Delegation failure handling prevents deadlocks** — fallback paths for each subagent type
- **Parallel execution is the real win** — investigator + builder can work simultaneously

---

## Common Misconception

"Subagents just add overhead — the main agent can do everything." — For a single-file change, yes. For a 5-file refactor, the main agent burns 20+ turns reading and re-reading context it already forgot. Subagents parallelize: investigator reads all 5 files in parallel and returns a summary in 1 turn. Main thread has full context without revisiting files.

---

## Feynman Explain

Explain why subagents produce better quality than one agent doing everything, even though all subagents run on the same model. (Answer: each subagent has a focused context window. Investigator's context = 3 files + 'find X.' Builder's context = 2 files + 'edit :line.' The main agent juggling 8 files + edit instructions + user conversation has diluted attention on each. Specialized agents make fewer mistakes because they handle less information at once.)

*When ready, run `learn.sh explain opencode-pro D1`.*

---

## Reframe

Spawning 3 subagents means 3x the LLM calls for the same task. Each has a cheap model context, but total cost multiplies. At what task complexity does parallel subagent cost beat sequential single-agent execution?

---

## Drill

Run: `learn.sh quiz opencode-pro D1`
