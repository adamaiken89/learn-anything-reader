# Playbook D2: DCP Internals

Est. study time: 2h
Language: en
Description: Understand and wield the Dynamic Context Protocol — compress boundaries, compaction lifecycle, message IDs, and plugin hooks. Design plugins that survive compression.

## Learning Objectives
- Understand DCP compaction lifecycle and phases — CILO #12
- Design and debug compress boundaries for optimal context retention — CILO #12
- Implement plugins with DCP hooks (before-compress, after-expand) — CILO #12
- Use message IDs to trace context state across compaction — CILO #12

---

## Core Content

### The Problem: "My plugin state disappears after compression"

You build a plugin that tracks tool call counts. After compress runs, your counter is gone. Your custom facts are lost. The agent has amnesia.

DCP (Dynamic Context Protocol) manages compression as a structured lifecycle, not a random truncation. Understanding the lifecycle lets you write plugins that survive compression and data that persists across compactions.

### The Compaction Lifecycle

```
Session Start
  │
  ├─ Phase 1: Detection — DCP identifies stale/section-closed content
  ├─ Phase 2: Summarization — stale content → compressed replacement (50-80% reduction)
  ├─ Phase 3: Retention — structured metadata (facts, counts, decisions) preserved in metadata block
  └─ Phase 4: Expansion — on query match, relevant compressed sections can be expanded via CCR

Each phase fires hooks:
  - before-compress: plugin saves state to metadata block
  - after-summarize: plugin validates compressed summary
  - after-expand: plugin restores state from metadata
```

### What Survives Compression

| Data Type | Survives? | Mechanism |
|-----------|-----------|-----------|
| AGENTS.md rules | ✓ | Prefixed system instruction, never compressed |
| Compress summaries | ✓ | Structured summary replaces original |
| Metadata (facts, counts) | ✓ | Plugin metadata block preserved |
| Session logs | ✓ | Written to disk, not in context |
| Tool output | ⚠ | Compressed (reversible via CCR) |
| Conversation context | ⚠ | Compressed to summary |
| Plugin runtime state | ✗ | Lost unless saved to metadata block |

---

## Setup

### 1. Monitor compression in action

```bash
# Enable DCP debug logging
export DCP_LOG_LEVEL=debug
```

Watch the compaction lifecycle in logs:
```
[DCP] Phase 1: Detection — found stale section at turns 45-67
[DCP] Phase 2: Summarization — compressed 22 messages into 180 token summary
[DCP] Phase 3: Retention — preserved metadata: { tool_calls: 34, errors: 2 }
```

### 2. Register plugin hooks

```typescript
// .opencode/plugins/stats-plugin.ts
import { dcp } from "@opencode/dcp";

dcp.hook("before-compress", async ({ context, metadata }) => {
  // Save plugin state to metadata before compression
  metadata.set("stats", {
    toolCalls: context.toolCalls,
    errors: context.errors,
    lastFile: context.lastFileEdited,
  });
});

dcp.hook("after-expand", async ({ metadata }) => {
  // Restore plugin state from metadata after expansion
  const stats = metadata.get("stats");
  if (stats) {
    context.restore(stats);
  }
});
```

---

## Wiring

### Wire compress boundaries

AGENTS.md:

```
## Compression Awareness

- Compress will close sections that are finished.
- Key decisions are preserved in metadata (not compressed away).
- If you need data to survive compression, save it to metadata:
  ```
  dcp.metadata.set("key-fact", { ... })
  ```
- If a compressed section needs expansion, call headroom_retrieve().
- Do not repeat information that was compressed — trust the summary.
```

### Wire custom plugin hooks into opencode.json

```json
{
  "plugins": [
    "oh-my-opencode",
    ".opencode/plugins/stats-plugin.ts"
  ],
  "dcp": {
    "preserve": ["tool-call-count", "error-log", "architecture-decisions"],
    "min-summary-length": 50,
    "max-compression-ratio": 0.8
  }
}
```

---

## Verification

```bash
# 1. DCP debug logging
export DCP_LOG_LEVEL=debug
# Run a session, trigger compression
# Expected: logs show compaction lifecycle phases

# 2. Plugin metadata survives compression
# After compress, check plugin state
dcp metadata get stats
# Expected: { toolCalls: 34, errors: 2, lastFile: "src/auth.ts" }

# 3. CCR expansion works
headroom_retrieve("the architecture decision we discussed")
# Expected: returns original uncompressed section about architecture

# 4. Metadata preserved across multiple compactions
# Run 3 sessions with compress between each
dcp metadata list
# Expected: cumulative facts across sessions (not just latest session)
```

---

## Key Takeaways

- **DCP is a structured lifecycle, not random truncation** — 4 phases: detection, summarization, retention, expansion
- **AGENTS.md rules survive compression** — prefixed system instruction, never touched
- **Plugin state dies with compression unless saved to metadata** — use `before-compress` hook
- **Metadata block preserves facts, counts, decisions** — survives across compactions and sessions
- **CCR makes compression reversible** — headroom_retrieve recovers original data
- **Message IDs trace context state** — every message has a unique ID, stable across compression
- **Design plugins for compression from day one** — hook into DCP lifecycle, don't fight it

---

## Common Misconception

"Compression deletes information permanently." — DCP preserves structured metadata (facts, decisions, state summaries) in a metadata block that compression never removes. The verbose conversation text is compressed to a summary, but key data points survive. CCR provides reversible access to originals. Information is reduced, not deleted.

---

## Feynman Explain

Explain the difference between compression phases and why the agent needs phase 3 (retention) even though phase 2 (summarization) already creates a readable summary. (Answer: the summary is for human reading — it says 'we decided to use Redis.' Phase 3 preserves machine-readable metadata: { decision: 'cache-backend', value: 'redis', alternatives: ['memory', 'memcached'], rationale: 'pubsub-needed' }. The agent can reason about this metadata procedurally without needing to re-read the summary prose.)

*When ready, run `learn.sh explain opencode-pro D2`.*

---

## Reframe

Designing plugins for compression survival adds complexity. Is it worth it for simple plugins (count tool calls, log errors)? Where's the threshold where you should invest in DCP-aware plugin design vs logging to file and re-reading?

---

## Drill

Run: `learn.sh quiz opencode-pro D2`
