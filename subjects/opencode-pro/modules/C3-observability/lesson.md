# Playbook C3: Observability

Est. study time: 2h
Language: en
Description: Monitor token usage, compression ratios, session quality, and errors. Wire headroom dashboard, plugin-level logging, event stream, and Sentry MCP.

## Learning Objectives
- Use headroom dashboard for live token savings + compression ratios — CILO #9
- Enable plugin-level logging for debugging agent behavior — CILO #9
- Configure event stream for agent actions as structured data — CILO #9
- Deploy Sentry MCP for error tracking in agent sessions — CILO #9

---

## Core Content

### The Problem: "How do I know if the harness is working?"

You set up rtk + headroom + codegraph. Is it saving tokens? Is the agent's context actually compressed? Is it making mistakes you don't notice because output is shaped?

Without observability, the harness is a black box. You hear about problems from the cost report at month-end or from a bug that made it to production.

### Observability Stack

```
Agent Actions                        Events                        Display
  │                                    │                              │
  ├─ Tool calls (type, duration)        │                              │
  ├─ Token usage (in/out, savings)      │── Event Stream ────────────>│ headroom dashboard
  ├─ Compression ratios                 │                              │ (live charts)
  ├─ Permission prompts (allow/deny)    │── Sentry MCP ──────────────>│ Sentry
  ├─ Errors and failures                │                              │ (error tracking)
  └─ Session metadata                   │                              │
```

---

## Setup

### 1. Start headroom dashboard

```bash
headroom dashboard
# Opens localhost:8788
```

Shows live: token savings (total + per-provider), compression ratio (overall + per-algorithm), cache hit rate (with/without CacheAligner), session activity (live tool calls, latency).

### 2. Enable plugin logging

```opencode.json
{
  "logging": {
    "level": "info",
    "plugins": {
      "headroom": "debug",
      "codegraph": "info",
      "vault": "info",
      "context7": "debug"
    },
    "output": {
      "file": ".opencode/logs/agent.log",
      "format": "json",
      "max-size": "50MB",
      "max-files": 5
    }
  }
}
```

### 3. Configure event stream

```bash
# Enable structured event stream
headroom events --output events.jsonl
```

Every agent action produces a structured event:

```jsonl
{"type":"tool_call","tool":"bash","command":"rtk ls","tokens_in":142,"tokens_out":8,"duration_ms":340,"timestamp":"...","session_id":"..."}
{"type":"permission","tool":"bash","command":"git push","decision":"ask","timestamp":"..."}
{"type":"compression","source":"tool_output","bytes_in":5120,"bytes_out":412,"ratio":0.08,"algorithm":"CodeCompressor"}
```

### 4. Install Sentry MCP

```bash
npm install -g @opencode/sentry-mcp
```

```opencode.json
{
  "mcpServers": {
    "sentry": {
      "command": "opencode-sentry-mcp",
      "args": ["--dsn", "your-sentry-dsn"]
    }
  }
}
```

---

## Wiring

### Wire dashboard into daily review

AGENTS.md:

```
## Observability

At the end of a session:
  - Report token savings from headroom (call `headroom stats`)
  - Report any permission denials or unusual errors
  - If debugging a failed task, check event stream for the failure point
```

### Wire Sentry for session error tracking

```opencode.json
{
  "mcpServers": {
    "sentry": {
      "command": "opencode-sentry-mcp",
      "args": ["--dsn", "your-sentry-dsn", "--capture-warnings", "--capture-permission-denials"]
    }
  }
}
```

Now every agent error, permission denial, and warning is captured in Sentry alongside your app errors. See the full agent trace: "user asked X → agent planned Y → ran command Z → command failed → agent retried → still failed → gave up."

---

## Verification

```bash
# 1. Dashboard loads
open http://localhost:8788
# Expected: token savings chart, compression ratio, cache hit rate

# 2. Plugin logging output
tail -f .opencode/logs/agent.log
# Expected: JSON log entries for every tool call

# 3. Event stream output
cat events.jsonl | head -5
# Expected: structured events (tool_call, permission, compression)

# 4. Sentry captures error
# In opencode, run a command that fails (e.g., "delete a nonexistent file")
# Expected: error captured in Sentry with full agent trace

# 5. Session savings report
headroom stats
# Expected: "Session tokens saved: 87% | Input: 142K → 18K | Output: 31K → 21K"
```

---

## Key Takeaways

- **headroom dashboard = live savings + compression analytics** — prove the harness works
- **Plugin-level logging = deep debugging** — set per-plugin verbosity, structured JSON output
- **Event stream = structured agent audit trail** — every tool call, permission, compression as JSONL
- **Sentry MCP = error tracking with agent trace** — see full agent context around failures
- **Without observability, harness is a black box** — you don't know if savings are real or agent is making mistakes
- **Metrics matter for buy-in** — "87% token reduction" is a number leadership understands

---

## Common Misconception

"Logging increases token usage and slows the agent down." — Plugin logging writes to file, not to LLM context. Zero token cost. The event stream is also file-based. Dashboard runs a local server that reads metrics from headroom's internal counters — no LLM calls. Observability has zero impact on agent performance or token bills.

---

## Feynman Explain

Explain why an event stream (structured JSONL) is more useful than reading the agent's full conversation log for debugging. (Answer: full conversation log is long prose — hard to search and aggregate. Event stream has structured fields: tool name, tokens, duration, decision. You can grep/filter/analyze programmatically: "find all permission denials in the last week" or "what's the average token savings per session." Prose logs require reading.)

*When ready, run `learn.sh explain opencode-pro C3`.*

---

## Reframe

Sentry MCP adds another service to run and maintain. At what team size/severity level does Sentry integration become worth the overhead? Could you get by with just headroom dashboard + event stream for a solo project?

---

## Drill

Run: `learn.sh quiz opencode-pro C3`
