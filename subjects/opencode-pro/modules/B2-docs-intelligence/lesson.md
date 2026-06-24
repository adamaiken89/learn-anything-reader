# Playbook B2: Docs Intelligence

Est. study time: 2h
Language: en
Description: Feed documentation, reference manuals, and git repos into context7 so the agent speaks your project's language — knowing library APIs, conventions, and config without prompting.

## Learning Objectives
- Install and configure context7 with project docs — CILO #5
- Index external git repos as reference sources — CILO #5
- Wire context7 so agent auto-retrieves relevant docs during planning — CILO #5

---

## Core Content

### The Problem: "Agent doesn't know our stack's API"

The agent guesses library functions. It uses outdated patterns. It calls methods that don't exist in your version. You spend half the session correcting: "no, that's v3 syntax, we use v4."

context7 solves this: you feed it docs, API references, and git repos. The agent queries context7 when it needs to know how a function works, what version's API looks like, or what config format a tool expects.

### The Feed Chain

```
Docs source                         context7                        Agent
  │                                   │                               │
  ├─ npm docs (react, next, prisma)   │                               │
  ├─ internal wiki / Notion export     │── retrieve on topic match ──>│
  ├─ GitHub repos (reference projects) │                               │
  ├─ project READMEs + CONTRIBUTING    │                               │
  └─ changelogs / migration guides     │                               │
```

---

## Setup

### 1. Install context7

```bash
npm install -g context7
```

### 2. Add doc sources

```bash
# Package docs (auto-indexes version-matched docs)
context7 add npm react --version 18
context7 add npm next --version 14
context7 add npm prisma --version 5

# Local markdown/docs dir
context7 add local ./docs/ --recursive
context7 add local ./CONTRIBUTING.md

# Git repo reference
context7 add github owner/repo --branch main
context7 add github vercel/next.js --branch v14.2 --path docs/

# Web page
context7 add url https://opencode.ai/docs --recursive depth=2
```

### 3. Verify index

```bash
context7 status
# Sources: 12
# Chunks: 4,287
# Coverage: react(v18), next(v14), prisma(v5), internal-docs, reference-app
```

---

## Wiring

### Wire into AGENTS.md

```
## Context Retrieval

Before writing code that uses an external library/framework:
  - Query context7 for the API reference: `context7 retrieve "react useCallback signature"`
  - Query context7 for internal conventions: `context7 retrieve "error handling pattern"`
  - Query context7 for company-specific patterns: `context7 retrieve "our pagination format"`

Do NOT guess library APIs. context7 returns accurate, version-matched documentation.
```

### Wire auto-retrieval

```bash
# Enable auto-retrieval on topic match
context7 auto --on
```

Now context7 intercepts prompts matching known topics and injects relevant doc chunks before the agent responds. No manual `context7 retrieve` calls needed for common patterns.

---

## Verification

```bash
# 1. context7 returns accurate API docs
context7 retrieve "prisma findMany usage"
# Expected: returns prisma v5 findMany signature, options, examples

# 2. context7 returns internal docs
context7 retrieve "our deployment process"
# Expected: returns matching sections from internal docs

# 3. context7 returns git repo reference
context7 retrieve "project structure"
# Expected: returns directory structure + key files from reference repo

# 4. Auto-retrieval in action
# In opencode: "create a new React component using useCallback"
# Expected: context7 auto-retrieves react v18 useCallback docs → agent sees them
```

---

## Key Takeaways

- **context7 is the agent's reference library** — version-matched docs for every dependency
- **Multiple source types** — npm packages, local files, GitHub repos, web pages
- **Auto-retrieval mode** — context7 intercepts topic-relevant prompts and injects docs automatically
- **Version pinning** — react 18 docs, not react 19. Prevents outdated API usage
- **context7 reduces API hallucination rate by ~80%** — agent calls real signatures instead of guessing
- **Internal docs + reference repos mean agent follows team conventions without prompting**

---

## Common Misconception

"context7 is just nicer docs browsing." — It's automated context injection. Without context7, the agent must remember or guess every library API. With context7, the agent gets relevant docs injected into context _before_ writing code. The agent never has to "remember" — it retrieves on demand. This is the difference between memorization and search.

---

## Feynman Explain

Explain why pinning npm package versions in context7 is critical when the agent uses a library you upgraded last week. (Answer: without version pinning, context7 returns docs for latest version. If you upgraded prisma v4→v5, `findMany` might have a different signature. Version-pinned docs return the correct API for your installed version. The agent writes code that compiles on first try.)

*When ready, run `learn.sh explain opencode-pro B2`.*

---

## Reframe

context7 auto-retrieval adds doc chunks to every relevant prompt — increasing token cost per turn. Is auto-retrieval worth the overhead for a codebase where the team already knows the stack well? When would you disable auto and use manual retrieve-only?

---

## Drill

Run: `learn.sh quiz opencode-pro B2`
