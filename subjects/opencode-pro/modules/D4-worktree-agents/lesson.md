# Playbook D4: Worktree + Background Agents

Est. study time: 2h
Language: en
Description: Run agents in parallel across git worktrees — one branch being developed while another is reviewed, a third is tested. Async agents that persist across sessions.

## Learning Objectives
- Set up git worktree isolation for parallel agent branches — CILO #14
- Configure opencode-background-agents for async long-running tasks — CILO #14
- Design context persistence so background agents resume after session close — CILO #14
- Handle conflict resolution across parallel agent branches — CILO #14

---

## Core Content

### The Problem: "I have to wait for one agent task to finish before starting the next"

Agent is running tests on branch feature-a (5 minutes). You want to start feature-b — can't, same working directory. Or: agent is researching an architecture question. You want it to keep working while you close the laptop.

Worktree isolation + background agents solve this: each branch gets its own worktree (parallel git checkout). Background agents run async and persist their context. You start agents, close the session, come back tomorrow to find results.

### Parallel Worktree Architecture

```
Project Root
  ├─ .git/
  ├─ worktrees/
  │   ├─ main/          (git worktree — stable)
  │   ├─ feature-a/     (git worktree — agent building feature A)
  │   │   └─ .opencode/ (isolated agent state for feature A)
  │   └─ feature-b/     (git worktree — agent building feature B)
  │       └─ .opencode/ (isolated agent state for feature B)
  ├─ src/
  └─ tests/
```

---

## Setup

### 1. Install opencode-background-agents

```bash
npm install -g opencode-background-agents
```

### 2. Create worktree for each agent

```bash
# Create worktree for feature A
git worktree add ../project-feature-a feature-a
cd ../project-feature-a && opencode init

# Create worktree for feature B
git worktree add ../project-feature-b feature-b
cd ../project-feature-b && opencode init
```

### 3. Configure background agent

```bash
# Start background agent for feature A
opencode background start --worktree ../project-feature-a --task "refactor user service to use new DB schema"
```

### 4. Check status

```bash
opencode background status
# Expected:
# Agent 'feature-a': running (45% complete, 12 tool calls, est 3m remaining)
# Agent 'feature-b': paused (23% complete, waiting for review)
```

---

## Wiring

### Wire background agent recovery

AGENTS.md:

```
## Background Agents

Background agents persist their context between sessions:
  - Compressed session state saved to .opencode/background/
  - On resume: agent reads compressed summary + metadata → continues where it left off
  - Long-running tasks (test suites, large refactors) can be delegated to background
```

### Wire conflict detection

```bash
# Before merging parallel branches
opencode conflict check --worktrees ../project-feature-a,../project-feature-b --base main
# Expected:
# No conflicts between feature-a and feature-b
# Both can merge to main independently
```

### Wire completion notifications

```opencode.json
{
  "background-agents": {
    "notifications": {
      "on-complete": "terminal",
      "on-error": ["terminal", "sentry"],
      "on-conflict": "terminal"
    }
  }
}
```

---

## Verification

```bash
# 1. Worktree creation
git worktree list
# Expected: main, feature-a, feature-b all listed with different worktree paths

# 2. Background agent runs independently
opencode background start --worktree ../project-feature-a --task "find and fix lint errors"
# Expected: "Agent 'feature-a' started in background"

# 3. Status check
opencode background status
# Expected: shows progress, tool calls, estimated completion

# 4. Session resume (simulate)
opencode background resume feature-a
# Expected: agent resumes from where it paused

# 5. Conflict detection
opencode conflict check --worktrees ../project-feature-a --base main
# Expected: "No conflicts" or list of conflicting files
```

---

## Key Takeaways

- **Git worktrees let parallel agents work on different branches** — no checkout conflicts
- **Each worktree has isolated agent state** — .opencode/ per worktree
- **Background agents persist context across sessions** — start, close laptop, resume tomorrow
- **Conflict detection prevents merge nightmares** — check before merging parallel branches
- **Completion notifications** — terminal or Sentry when background task finishes
- **True parallelism** — agent runs tests while you start the next feature

---

## Common Misconception

"Background agents consume API calls even when I'm not looking — expensive." — Yes, they cost tokens. But the cost of a background agent completing a task is identical to doing it interactively. The difference is *when* it runs — during your lunch break or overnight. Cost-neutral, time-positive. Background agents make sense for tasks that take 5+ minutes of wall-clock time (test suites, large refactors, dependency analysis).

---

## Feynman Explain

Explain why git worktrees are necessary for parallel agents. Why can't two agents just work in the same directory on different branches? (Answer: git checkout switches the working directory. If agent A is on feature-a with modified files, and agent B runs `git checkout feature-b`, agent A's changes are lost or conflicted. Worktrees give each branch its own working directory with shared .git. Both agents edit files simultaneously without stepping on each other.)

*When ready, run `learn.sh explain opencode-pro D4`.*

---

## Reframe

Worktree + background agents add infrastructural complexity. When does the productivity gain of parallel agents outweigh the setup overhead? What's the minimum task duration where background agents make sense?

---

## Drill

Run: `learn.sh quiz opencode-pro D4`
