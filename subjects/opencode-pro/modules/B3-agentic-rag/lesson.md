# Playbook B3: Agentic RAG

Est. study time: 2.5h
Language: en
Description: Build a 3-tier retrieval pipeline — codegraph (code structure) → graphify (relationships) → context7 (docs) — that gives the agent comprehensive context without manual prompting.

## Learning Objectives
- Chain codegraph → graphify → context7 for 3-tier context retrieval — CILO #5
- Use headroom retrieve for original data recovery inside compressed sessions — CILO #5
- Use skillful to load skills on demand without manual intent — CILO #5
- Wire AGENTS.md so agent automatically tier-escalates when context is insufficient — CILO #5

---

## Core Content

### The Problem: "I have all these tools but the agent doesn't use them together"

You installed codegraph, context7, graphify, headroom. Each works independently. But the agent doesn't chain them: it codegraph-explores a symbol, doesn't find enough context, and gives up instead of escalating to context7 for docs or graphify for relationships.

Agentic RAG solves this: define retrieval tiers with escalation rules. If tier 1 returns thin results, the agent automatically queries tier 2. If tier 2 is still insufficient, tier 3. The agent never settles for partial context.

### 3-Tier Retrieval

```
Tier 1: Codegraph (instant, local)
  └─ Symbol definitions, call paths, file locations
  └─ Cost: Free (local), 300ms
  └─ But: No docs, no external references, no intent

  If thin results → escalate

Tier 2: Graphify (persistent knowledge graph)
  └─ Cross-file relationships, dependency maps, historical queries
  └─ Cost: Free (local), 500ms
  └─ But: No external context, no documentation

  If still insufficient → escalate

Tier 3: Context7 (docs + external references)
  └─ Library APIs, internal docs, reference repos
  └─ Cost: Free (local), 1-2s
  └─ Complete: docs + conventions + architecture
```

---

## Setup

### 1. Verify all 3 tiers installed

```bash
codegraph status && graphify list && context7 status
# All 3 should return healthy
```

### 2. Install headroom retrieve connector

```bash
headroom plugin install retrieve
```

This lets headroom retrieve original data from compressed sessions — so agentic RAG can decompress on demand.

### 3. Install skillful

```bash
npm install -g opencode-skillful
```

```opencode.json
{
  "plugin": ["opencode-skillful"]
}
```

skillful auto-detects user intent and loads the right skill. When you type "I want to understand this auth flow", skillful loads the codebase-investigation skill (codegraph explore → graphify query → context7 retrieve).

---

## Wiring

### Wire 3-tier retrieval into AGENTS.md

```
## Retrieval Protocol

Always use 3-tier retrieval in order:

Tier 1 — Codegraph (code structure):
  call `codegraph explore "<question>"` for symbol definitions and call paths
  If results are thin (<3 relevant symbols), escalate.

Tier 2 — Graphify (relationships):
  call `codegraph graphify query "<relationship question>"` for cross-file dependencies
  If still cannot answer, escalate.

Tier 3 — Context7 (docs):
  call `context7 retrieve "<question>"` for documentation, API references, conventions
  If all 3 tiers fail, report: "Retrieval exhausted for: <question>"

Do NOT skip tiers. Do NOT rely on codegraph alone for documentation questions.
```

### Wire skillful for automatic skill loading

AGENTS.md:

```
## Skill Detection

skillful auto-detects user intent and loads the matching skill. Do not override.
Available detection intents: code-investigate, architecture-review, security-audit, test-generation, deploy-prep
When skillful loads a skill, follow its instructions exactly.
```

### Wire headroom_retrieve for compressed sessions

AGENTS.md:

```
## Decompression

If a codegraph or context7 result seems truncated or compressed:
  call `headroom_retrieve("<original-topic>")` to get the original uncompressed data
  This is safe even in compressed sessions — headroom stores originals via CCR.
```

---

## Verification

```bash
# 1. Tier 1 → 2 escalation
codegraph explore "auth middleware flow"
# If thin: graphify query "what modules depend on auth middleware"
# Expected: agent auto-escalates without prompting

# 2. Tier 3 fallback
codegraph explore "prisma findMany options"
# Expected: codegraph returns nothing (prisma not in codegraph) → context7 retrieve "prisma findMany usage"
# Returns: v5 signature, options, examples

# 3. skillful auto-detect
# Prompt: "Let me understand the payment processing architecture"
# Expected: skillful detects code-investigate intent → loads codebase-investigation skill
# Agent runs codegraph explore → graphify → context7 automatically

# 4. headroom_retrieve in compressed session
# After 50 turns with headroom compression, prompt: "what was the auth flow again"
# Expected: agent calls headroom_retrieve("auth flow") → gets original from CCR cache
```

---

## Key Takeaways

- **3-tier retrieval covers all context needs** — code structure (1), relationships (2), docs (3)
- **Automatic escalation** — agent moves to next tier when current tier is insufficient
- **skillful bridges intent and execution** — detects what kind of task and loads matching skill
- **headroom_retrieve recovers originals** — compression doesn't mean data loss
- **Each tier costs fractions of a cent** — all local, no API calls
- **Without agentic RAG, agent uses one tool and gives up** — with it, agent chains until it has comprehensive context

---

## Common Misconception

"RAG is only for vector databases and embeddings." — Traditional RAG is vector-search heavy. Agentic RAG uses specialized tools that return structured code intelligence (codegraph), relationship graphs (graphify), and curated documentation (context7). No embeddings, no vector DB, no chunking. Each tool returns exactly what the agent needs in the format the agent can use.

---

## Feynman Explain

Explain why 3-tier retrieval produces better results than asking one tool for everything. What does codegraph know that context7 doesn't? What does context7 know that codegraph doesn't? (Answer: codegraph knows symbol locations, types, and call sites — it doesn't know documentation intent. context7 knows API docs and conventions — it doesn't know your specific codebase's call graph. They are complementary. Chain them to get complete context: 'where is this function defined and what does its documentation say it should do?')

*When ready, run `learn.sh explain opencode-pro B3`.*

---

## Reframe

3-tier retrieval adds latency — up to 3 tool calls per question. Is this acceptable in interactive use? How would you adapt the protocol for quick questions (where speed matters more than completeness) vs architecture reviews (where completeness matters more than speed)?

---

## Drill

Run: `learn.sh quiz opencode-pro B3`
