# Playbook A1: Zero-to-Harness

Est. study time: 2h
Language: en
Description: Get from zero to a working OpenCode harness with rtk, headroom, codegraph, oh-my-opencode, and your first agent loop in under 30 minutes.

## Learning Objectives (maps to course CILOs)
- Install and configure OpenCode with project initialization — CILO #1
- Set up rtk as command proxy for all shell interactions — CILO #1
- Bootstrap oh-my-opencode for 50+ pre-built tools — CILO #1
- Wire headroom wrap to compress agent context by default — CILO #2
- Complete first plan→build→review agent cycle — CILO #6

---

## Core Content

### The Problem: "Where do I even start?"

You installed opencode. You ran `/init`. Now what?

The default install is bare. No compression. No codebase graph. No tools. Every session starts cold — you waste tokens, context fills with noise, and the agent has zero memory of your codebase.

The harness solves this: a bootstrap that wires rtk + headroom + codegraph + oh-my-opencode in one pass, so every session after is token-efficient and codebase-aware.

### The Harness (what slots together)

```
Terminal
  └─ rtk            — wraps every command (ls, git, grep) → compact output
      └─ opencode    — agent runtime
          ├─ headroom wrap — compresses all tool output before LLM sees it
          ├─ codegraph     — indexed codebase graph (explore/node/callers)
          ├─ oh-my-opencode — 50+ pre-built tools + LSP/AST/MCP
          ├─ .opencode/    — team config, skills, custom tools
          └─ AGENTS.md    — project rules the agent reads on every turn
```

A single `opencode` session loads all of this automatically. The agent knows your codebase, speaks in compressed tokens, and has every common tool pre-installed.

---

### Setup

#### 1. Install opencode

```bash
curl -fsSL https://opencode.ai/install | bash
```

Verify: `opencode --version`

#### 2. Install harness tools

```bash
# rtk — command output compressor
brew install rtk-cli

# headroom — context compression layer
pip install "headroom-ai[all]"

# codegraph — codebase indexing
npm install -g codegraph

# oh-my-opencode — pre-built tools + agents
npm install -g oh-my-opencode
```

#### 3. Initialize project

```bash
cd /your/project
opencode
# Inside TUI: run /init
```

`/init` creates `.opencode/` directory and `AGENTS.md` in project root. Commit both to git.

#### 4. Configure AGENTS.md

Edit `AGENTS.md` to include harness rules:

```
## Harness rules
- Always prefix commands with `rtk` (e.g. `rtk ls`, `rtk git log`, `rtk find`)
- Use `codegraph explore` for codebase questions before writing code
- Use `codegraph node` to read a file or inspect a symbol before editing
- Load oh-my-opencode tools via `skill({name:"oh-my-opencode"})` when needed
- AGENTS.md rules apply on every turn — do not repeat instructions
```

---

### Wiring

#### Wire rtk globally

```opencode.json
{
  "agent": {
    "build": {
      "permission": {
        "bash": {
          "rtk *": "allow",
          "*": "ask"
        }
      }
    }
  }
}
```

AGENTS.md rule: `prefix all commands with rtk`

Result: agent runs `rtk ls` instead of `ls`. rtk strips whitespace, truncates long lines, groups output. ~60% fewer tokens from shell output.

#### Wire headroom wrap

```bash
headroom wrap opencode
```

This starts a proxy on port 8787 and configures opencode to route through it. All tool output passes through headroom's compression pipeline (SmartCrusher for JSON, CodeCompressor for code, Kompress-base for prose) before reaching the agent.

#### Wire codegraph

```bash
codegraph init
codegraph index
```

Verify: `codegraph status` shows indexed files and symbols.

Add to AGENTS.md:

```
When exploring code: use `codegraph explore "<natural language question>"` before reading files. Returns relevant symbol source + call paths in one call.
```

#### Wire oh-my-opencode

Installation already done. Add to `opencode.json`:

```opencode.json
{
  "plugin": ["oh-my-opencode"]
}
```

This loads 50+ pre-built tools: LSP references, AST queries, git helpers, MCP integrations, and curated agent configs. No need to write custom tools for common tasks — they're already available.

---

### Verification

Run this smoke test:

```bash
# 1. headroom proxy running
headroom proxy --port 8787 &
# Should print: "Proxy server running on http://127.0.0.1:8787"

# 2. rtk works
rtk ls --help | head -3
# Should show: "A high-performance CLI proxy..."

# 3. codegraph ready
codegraph status
# Should show: indexed files, symbols, last index time

# 4. OpenCode sees harness
opencode
# Inside TUI: type "rtk git log --oneline -5"
# Agent should use rtk prefix. Output expected compact.

# 5. First full agent cycle
# Prompt: "Plan then implement: add a function that greets by name"
# Agent should: plan first (Plan mode), switch to Build, implement
```

---

## Key Takeaways

- **rtk** is the first layer — compresses command output before it enters opencode
- **headroom** is the second layer — runs as proxy, compresses everything further (60-95%)
- **codegraph** gives the agent codebase intelligence — no more blind grep+read loops
- **oh-my-opencode** provides 50+ pre-built tools — skip writing custom tools for 80% of needs
- **AGENTS.md** is the leverage point — rules here fire on every turn, including harness instructions
- Combo: rtk → headroom → codegraph → agent saves ~70% tokens + 3x faster context loading

---

## Common Misconception

"My opencode works fine without all this setup." — True for a single-file project. On any real codebase (10k+ files, 5+ languages, external deps), the default config wastes $50+/month on noise tokens, agent misses context, and you manually paste file paths. The harness pays for itself in week 1.

---

## Feynman Explain

Explain why `rtk ls` saves more tokens than `headroom wrap opencode` alone, even though headroom also compresses output. (Answer: rtk drops unused columns, truncates long lines, groups entries _at the source_ — headroom sees already-reduced data and can apply deeper compression like JSON flattening and AST summarization. Stacked compression compounds. Each layer removes different waste.)

*When ready, run `learn.sh explain opencode-pro A1` — AI will probe your explanation for gaps.*

---

## Reframe

The harness costs ~5 minutes of setup. In return, every opencode session from now on is token-efficient and codebase-aware. Which of the four components (rtk, headroom, codegraph, oh-my-opencode) would you drop first if you had to cut one? Why?

---

## Drill

Run: `learn.sh quiz opencode-pro A1`
