# Playbook B4: Custom Tools Arsenal

Est. study time: 2.5h
Language: en
Description: Design, build, and deploy custom tools that encode team conventions as code. Use tool-helper, Zod schemas, multi-tool patterns, and oh-my-opencode extensions.

## Learning Objectives
- Design custom tools with tool-helper and Zod parameter schemas — CILO #6
- Build multi-tool patterns (tool chains that compose) — CILO #6
- Publish custom tools via oh-my-opencode extensions — CILO #6
- Wire tools to AGENTS.md skills for automatic loading — CILO #6

---

## Core Content

### The Problem: "The agent doesn't know our team's specific workflows"

You have a specific testing convention (Vitest + MSW + factory fixtures). You have a deployment script that tags releases by semver. You have a code review checklist that covers your team's common errors. Every time you ask the agent to do one of these, you must explain the whole process.

Custom tools encode these as one-shot commands. The agent installs the tool, and the tool handles all the steps. One tool call replaces 10 minutes of instruction.

### The Tool Pattern

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Tool Helper  │     │  Zod Schema  │     │   Execute    │
│  (CLI gen)    │────>│  (validate)  │────>│  (run steps) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │
       │ --name=gen-test     │ name: z.string()    │ reads template
       │ --target=src/auth   │ target: z.path()    │ writes test file
       │                     │ msw: z.boolean()    │ installs deps
```

---

## Setup

### 1. Install tool-helper

```bash
npm install -g @opencode/tool-helper
```

### 2. Set up tool directory

```bash
mkdir -p .opencode/tools
```

### 3. Create first tool: test generator

`.opencode/tools/gen-test.ts`:

```typescript
import { tool } from "@opencode/tool-helper";
import { z } from "zod";

export default tool({
  name: "gen-test",
  description: "Generate a Vitest test file with MSW handlers and factory fixtures",
  parameters: z.object({
    target: z.string().describe("path to source file being tested"),
    name: z.string().optional().describe("test name (defaults to file name)"),
    withMsw: z.boolean().default(true).describe("include MSW handler stub"),
  }),
  execute: async ({ target, name, withMsw }) => {
    // Read source file, extract exports, generate test template
    // Create .test.ts file with factory fixtures
    // If withMsw, generate handler file with mock endpoints
    return `Created test for ${target}`;
  },
});
```

---

## Wiring

### Wire into AGENTS.md

```
## Custom Tools

These custom tools are available in .opencode/tools/:
  - gen-test (target, name?, withMsw?) — Generate Vitest test with MSW + fixtures
  - gen-component (name, dir?, props?) — Generate React component with stories + tests
  - deploy-check (env?) — Run pre-deploy checklist (lint, test, build, tag)
  - review-pr (base?) — Generate PR review checklist for current diff

When a task matches a tool's purpose, use the tool instead of manual implementation.
```

### Tool loading

`opencode.json`:

```json
{
  "tools": {
    "dir": ".opencode/tools",
    "auto-load": true
  }
}
```

### Multi-tool patterns

Tools can compose:

```typescript
// gen-component.ts — generates component, then runs gen-test on it
import { invoke } from "@opencode/tool-helper";

const componentResult = await invoke("gen-component", { name: "UserCard" });
await invoke("gen-test", { target: componentResult.filePath });
```

This is the multi-tool pattern: one tool calls another. Common for workflows:
- `new-feature` → `gen-component` + `gen-test` + `gen-story`
- `deploy` → `deploy-check` + `bump-version` + `git-tag` + `npm-publish`

---

## Verification

```bash
# 1. Tool list
opencode tools
# Expected: lists all tools in .opencode/tools/ with descriptions

# 2. Test generation
# Prompt: "Generate a test for src/services/auth.ts"
# Expected: agent uses gen-test tool, creates auth.test.ts + auth.handlers.ts

# 3. Multi-tool workflow
# Prompt: "Create a new UserCard component with tests and story"
# Expected: agent invokes gen-component, which chains gen-test + gen-story

# 4. Zod validation failure
# Prompt: "Generate test for" (missing target)
# Expected: tool rejects with "target: Required — path to source file being tested"
```

---

## Key Takeaways

- **Custom tools encode team conventions as one-shot commands** — no repeated instruction
- **tool-helper + Zod = typed, validated, documented tools** — agent uses them correctly by schema
- **Multi-tool patterns chain workflows** — one tool calls another for complex operations
- **Tools are loaded from .opencode/tools/** — version-controlled with the project
- **Agent prefers tools over manual implementation** — AGENTS.md instructs "use tool when purpose matches"
- **Each tool replaces 5-15 minutes of instruction per use** — payback on second invocation

---

## Common Misconception

"Writing a custom tool is more work than just telling the agent what to do once." — For a one-off task, yes. But teams repeat workflows daily (test generation, deploy prep, code review). A 30-minute tool saves 10 minutes per use. After 3 uses, it's break-even. After 10, it's 5 hours saved.

---

## Feynman Explain

Explain why Zod schema validation for tool parameters matters when the agent could just ask for help. (Answer: without validation, agent passes `target: undefined` or `target: 42` and the tool fails silently or does the wrong thing. Zod validates types and required fields before execution. The agent gets an immediate, clear error: 'target: Expected string, received number' — it fixes the parameter and retries. No silent failures, no wrong outputs.)

*When ready, run `learn.sh explain opencode-pro B4`.*

---

## Reframe

oh-my-opencode provides 50+ pre-built tools. When should you write a custom tool instead of using a pre-built one? What signals that your team's need is specific enough to warrant a custom tool? (Answer: pre-built for generic tasks (LSP, AST, git). Custom for team-specific workflows — your test generator, your deployment pipeline, your code review checklist.)

---

## Drill

Run: `learn.sh quiz opencode-pro B4`
