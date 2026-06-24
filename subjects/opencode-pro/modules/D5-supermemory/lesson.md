# Playbook D5: Supermemory

Est. study time: 2h
Language: en
Description: Give the agent persistent memory across sessions using opencode-supermemory. Facts survive compression, survive session close, and are recallable weeks later.

## Learning Objectives
- Install and configure opencode-supermemory for cross-session persistence — CILO #15
- Define memory facts with TTL and importance scores — CILO #15
- Implement compaction-survival memory design — CILO #15
- Build recall workflows for multi-session projects — CILO #15

---

## Core Content

### The Problem: "Every new session, the agent forgets everything"

You spent 2 hours yesterday teaching the agent your project's architecture. Today: "let me grep that again." The agent has amnesia. Every session is a first date.

Supermemory solves this: facts survive compression and session close. The agent remembers last week's architecture decisions, your preferred patterns, and project-specific conventions — without re-reading yesterday's conversation.

### Memory Architecture

```
Session 1               Session 2               Session 3
  │                       │                       │
  ├─ "We use Redis"       │                       │
  ├─ "Auth is JWT-based"  │── recall on query ──>│ "Remember auth approach"
  ├─ "DB schema v3"       │                       │──── yes, JWT-based ──→
  │                       │                       │
  └── memory.store() ────>└── memory.store() ────>└── memory.store()
        │                       │                       │
        └─────────────── supermemory DB ────────────────┘
                        (facts with TTL + importance)
```

---

## Setup

### 1. Install supermemory

```bash
npm install -g opencode-supermemory
```

### 2. Initialize memory store

```bash
supermemory init
# Creates ~/.opencode/supermemory/ with SQLite-backed store
```

### 3. Configure retention

```opencode.json
{
  "plugins": ["opencode-supermemory"],
  "supermemory": {
    "store": "~/.opencode/supermemory/memory.sqlite",
    "default-ttl": "30d",
    "max-facts-per-session": 20,
    "importance-threshold": 3
  }
}
```

---

## Wiring

### Wire memory storage

AGENTS.md:

```
## Supermemory Protocol

- When you learn a persistent fact about the project, store it:
  `supermemory store "auth is JWT-based with 24h expiry" --importance 5 --ttl 90d`

- Before answering a question about project conventions, recall:
  `supermemory recall "auth"` → returns stored facts matching "auth"

- Memory facts tagged with importance ≥3 survive compression automatically.
- Low-importance facts are eligible for compression pruning.
- Do NOT store: temporary task state, file contents, session logs. Store: decisions, conventions, architecture.

## Recall Priority

1. supermemory recall — persistent cross-session facts
2. AGENTS.md — current session rules
3. graphify knowledge graph — code intelligence
4. context7 — documentation
```

### Wire memory into Plan phase

```
## Plan Phase (before building)

Before implementation:
  1. supermemory recall matching current task context
  2. Check if architecture decision was made in a previous session
  3. Check if preferred pattern is already documented in memory
  4. Only if memory is empty, ask user and store result
```

---

## Verification

```bash
# 1. Store a fact
supermemory store "deploy uses GitHub Actions with pnpm" --importance 4 --ttl 90d
# Expected: "Stored: 'deploy uses GitHub Actions with pnpm' (importance: 4, expires: 90d)"

# 2. Recall facts
supermemory recall "deploy"
# Expected: returns matching facts with importance and expiry

# 3. Session persistence
# Close opencode, reopen, ask: "how do we deploy?"
# Expected: agent recalls from supermemory (not "let me check the repo")

# 4. Memory survives compression
# Run 100 turns with compression, then ask a question from session 1
# Expected: relevant facts survive in supermemory

# 5. Memory stats
supermemory stats
# Expected: "Total facts: 47 | Active: 42 | Expired: 5 | Queries: 312"
```

---

## Key Takeaways

- **Supermemory gives the agent long-term recall** — facts survive session close and compression
- **Facts have importance + TTL** — important facts persist, low-importance facts prune naturally
- **Recall before building** — check if previous session already made the decision
- **Memory is not conversation history** — it's distilled facts: decisions, conventions, architecture
- **Supermemory + AGENTS.md + graphify = three-tier long-term memory** — rules, facts, code intelligence
- **After 2 weeks of use, the agent knows your project as well as a senior team member**

---

## Common Misconception

"Supermemory will fill up with junk after a month." — Facts have TTL (default 30d). Expired facts auto-purge. max-facts-per-session (20) prevents bulk stores. importance-threshold (3) means only meaningful facts survive. Memory is self-cleaning — noisy facts expire, important facts persist.

---

## Feynman Explain

Explain the difference between storing "we decided to use Redis for caching" vs storing "file: /src/cache/index.ts imports Redis." Which one belongs in supermemory and why? (Answer: the architecture decision belongs — it's a persistent project convention. The file location belongs in codegraph — it changes when files move. Supermemory is for *why* and *what we decided*, not *where in the filesystem*. File locations are ephemeral; architectural decisions outlast file moves.)

*When ready, run `learn.sh explain opencode-pro D5`.*

---

## Reframe

Supermemory means the agent accumulates knowledge about your project indefinitely. At what point does old knowledge become stale and misleading? How would you audit supermemory facts for accuracy? Should there be a "forget" workflow for outdated facts?

---

## Drill

Run: `learn.sh quiz opencode-pro D5`
