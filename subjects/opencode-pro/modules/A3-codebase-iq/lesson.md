# Playbook A3: Codebase IQ

Est. study time: 2.5h
Language: en
Description: Give your agent persistent codebase intelligence using codegraph indexing, graphify knowledge graphs, and the explore/node/watch tool chain.

## Learning Objectives
- Initialize and configure codegraph for multi-language projects — CILO #3
- Use codegraph explore for natural-language codebase queries — CILO #3
- Use codegraph node to read files + inspect symbols in one call — CILO #3
- Build graphify knowledge graphs for cross-session context persistence — CILO #3
- Wire codegraph watch for auto-reindex on file changes — CILO #3

---

## Core Content

### The Problem: "Agent doesn't know my codebase"

Without codegraph, every session starts cold. The agent greps for "class Foo", gets 200 lines, reads the wrong file, greps again. Each cycle burns 10-30 seconds and thousands of tokens. After 5 turns the context is full of dead-end search results, and the agent still doesn't understand the architecture.

codegraph fixes this: it pre-indexes every file, symbol, and call site. The agent queries the index instead of the filesystem.

### The Diff: Without vs With codegraph

**Without codegraph** (what every new user experiences):
```
Agent: grep -r "class UserService" src/
      → reads src/services/user.ts (not sure if right file)
      → greps "findAll" in src/repositories/
      → reads wrong repo, backtracks
      → 4 minutes, 14,000 tokens, wrong architecture picture
```

**With codegraph** (single call):
```
Agent: codegraph explore "UserService findAll callers"
      → returns UserService.findAll at src/services/user.ts:45
      → calls UserRepository.findAll at src/repositories/user.ts:112
      → called by UserController.index at src/controllers/user.ts:23
      → 1 call, 800 tokens, complete picture
```

---

## Setup

### 1. Initialize codegraph

```bash
cd /your/project
codegraph init
```

This creates `.codegraph/` directory with config. Edit `.codegraph/config.yaml` for your project:

```yaml
index:
  include:
    - "src/**/*.{ts,js,rs,go,py}"
    - "lib/**/*.{rb,ex}"
  exclude:
    - "**/node_modules/**"
    - "**/vendor/**"
    - "**/*.test.*"
    - "**/*.spec.*"
  languages:
    - tree-sitter: [python, typescript, rust, go, java, ruby]
```

### 2. Build index

```bash
codegraph index
```

First build may take 30-120s for large repos. Subsequent builds are incremental (re-index changed files only).

### 3. Verify index

```bash
codegraph status
# Files indexed: 3,412
# Symbols indexed: 28,147
# Last index: 12s ago
# Coverage: 94.2%

codegraph search "class.*Service" --kind class --limit 5
# Returns 5 class definitions
```

---

## Wiring

### Wire codegraph into AGENTS.md

```
## Codebase Intelligence

Before writing code, call:
  - `codegraph explore "<question>"` — natural language query about codebase. Returns relevant symbol source + call paths in one call.
  - `codegraph node <symbol-or-file> --includeCode` — read a file or inspect a symbol (including body)

After reading codegraph output, you have accurate context. Do not grep+read as fallback unless codegraph returns nothing.

Never read a file with the Read tool if codegraph node can serve it — node includes dependency info.
```

### Wire codegraph graphify

graphify extracts relationships from the codegraph index into a queryable knowledge graph:

```bash
codegraph graphify create --name "my-project"
codegraph graphify query "what modules depend on auth service?"
# Returns: user-service, order-service, payment-service all import from auth.service
```

This knowledge persists across sessions. You can reference yesterday's graph queries today.

### Wire codegraph watch

```bash
codegraph watch &
```

Runs in background, re-indexes on file save. Typical lag: 200-500ms. The index is always fresh.

### Wire graphify into headroom wrap

graphify facts survive compression because headroom preserves structured metadata:

```bash
codegraph graphify export | headroom import --namespace codebase-facts
```

Now codegraph facts are available even inside compressed sessions — compression eliminates verbosity, not knowledge.

---

## Verification

```bash
# 1. codegraph at work (fast symbol lookup)
codegraph explore "find all routes defined in the api module"
# Expected: list of route definitions + middleware stack + controller bindings

# 2. codegraph node as file reader replacement
codegraph node src/services/user.ts
# Returns: file source with line numbers + "Depended by: auth.ts, order.ts, payment.ts"

# 3. graphify persistence
codegraph graphify query "list all external API dependencies"
# Expected: structured list of imports from external packages

# 4. Performance comparison
# Without codegraph: grep for a symbol → read 3+ files → 2 min, 5,000 tokens
# With codegraph:
time codegraph explore "where is authenticateUser defined?"
# ~1.5s, ~400 tokens
```

---

## Key Takeaways

- **codegraph explore replaces grep+read loops** — single call returns symbol source + call paths
- **codegraph node is a smarter file reader** — includes dependency info (who calls this? what does this call?)
- **graphify persists cross-session knowledge** — yesterday's queries available today
- **codegraph watch keeps index fresh** — sub-second auto-reindex on file changes
- **graphify + headroom = facts survive compression** — knowledge persists even with aggressive token reduction
- **codegraph init first build costs 30-120s. Every subsequent build: incremental <2s.**

---

## Common Misconception

"codegraph explore and grep are the same thing, just faster." — They are not equivalent. grep returns raw text lines in arbitrary order. codegraph explore returns structured symbol definitions + call graphs + file locations in one call. The agent doesn't have to piece together meaning from scattered text matches. It gets a coherent "here's the architecture" on first call.

---

## Feynman Explain

Explain why `codegraph explore "UserService"` returns better context than `rg -r "class UserService" src/` then reading the file manually. What information does the index carry that plain text search loses? (Answer: the index tracks call sites, type references, inheritance chains, and file-level dependency direction. Plain text search gives you lines. The index gives you a graph. When you ask "UserService", the agent gets not just where UserService is defined, but what calls it, what it calls, and what type it references — in one structured response.)

*When ready, run `learn.sh explain opencode-pro A3`.*

---

## Reframe

codegraph gives the agent perfect recall of your codebase. Does this reduce the need for documentation? What's the risk of relying on codegraph alone — what does it miss that well-written docs capture? (Answer: codegraph captures structure and call chains, not intent or design rationale. Good docs explain *why* a module exists, *when* to add to it vs create a new one, and *what* trade-offs were made.)

---

## Drill

Run: `learn.sh quiz opencode-pro A3`
