# Playbook B1: Secrets Harness

Est. study time: 2.5h
Language: en
Description: Zero-trust secrets management for agent workflows — vault MCP, database MCP, shell environment wrapping, and custom credential injection without exposing secrets to the LLM.

## Learning Objectives
- Deploy vault MCP for secrets injection without LLM seeing raw credentials — CILO #4
- Configure database MCP for read-only query access via trusted proxy — CILO #4
- Build custom shell wrapper that injects environment variables from vault — CILO #4
- Wire permission rules so agent can use secrets without revealing them — CILO #4

---

## Core Content

### The Problem: "Agent asks me for my API key"

Default behavior: agent needs a token → "What's your DATABASE_URL?" → you paste it → it's in the LLM context → exposed to third-party API → never rotated. This is the #1 security violation in AI-assisted coding.

The secrets harness solves this: secrets live in vault MCP. The agent triggers commands that use credentials without ever seeing them. The LLM never has the secret in context.

### Architecture

```
Agent (LLM)            Vault MCP              Shell
    │                     │                     │
    │ "deploy to prod"    │                     │
    │────────────────────>│                     │
    │                     │ inject creds        │
    │                     │────────────────────>│
    │                     │  env vars set       │
    │                     │<────────────────────│
    │<── permission ask ──│                     │
    │ "Allow deploy?"     │                     │
    │──── yes ───────────>│                     │
    │                     │ run deploy          │
    │                     │────────────────────>│
    │                     │          output (no secrets in context)
```

Agent never sees `DATABASE_URL`, `API_KEY`, or `DEPLOY_TOKEN`. It only sees "deploy succeeded" or "deploy failed: connection timeout."

---

## Setup

### 1. Install and start vault MCP

```bash
# Install vault MCP server
npm install -g @opencode/vault-mcp

# Start with config
opencode vault-mcp --config ~/.opencode/vault.yaml
```

### 2. Configure vault

`~/.opencode/vault.yaml`:

```yaml
vaults:
  local:
    type: file
    path: ~/.opencode/secrets/
    permissions:
      - "deploy: [DEPLOY_TOKEN, DEPLOY_HOST]"
      - "db: [DATABASE_URL, DB_PASSWORD]"
      - "api: [API_KEY, API_SECRET]"

  env:
    type: env
    variables:
      - DATABASE_URL
      - API_KEY
      - GITHUB_TOKEN

users:
  - name: "agent"
    allowed_vaults: [local, env]
    allowed_operations:
      - inject    # agent can request credential injection for commands
      - verify    # agent can check if credential is set (not its value)
    denied_operations:
      - read       # agent must NEVER see raw credential values
      - export     # agent must NEVER dump credentials to context
```

### 3. Set up database MCP

```bash
npm install -g @opencode/db-mcp
```

`opencode.json`:

```json
{
  "mcpServers": {
    "vault": {
      "command": "opencode-vault-mcp",
      "args": ["--config", "~/.opencode/vault.yaml"]
    },
    "database": {
      "command": "opencode-db-mcp",
      "args": ["--read-only", "--allow-tables", "users,orders,products"]
    }
  }
}
```

Database MCP runs read-only by default. The agent can query schemas and run SELECT. It cannot INSERT, UPDATE, DELETE, or DROP.

---

## Wiring

### Wire vault permissions into AGENTS.md

```
## Secret Handling

- Never ask the user for API keys, tokens, or database URLs.
- If a command needs credentials, request vault MCP injection: `vault.inject("deploy")`.
- Vault returns permission prompt: "Agent wants to run deploy with [DEPLOY_TOKEN]. Allow? (yes/no/always)"
- You see the command output, not the credential values.
- If vault MCP is unreachable, report error — do not fallback to asking user for secrets.
```

### Wire database MCP for development queries

```
## Database Access

Use database MCP for schema exploration and data queries:
  - `db.tables()` — list tables
  - `db.schema("users")` — show columns, types, indexes
  - `db.query("SELECT * FROM products LIMIT 5")` — read data
All queries run read-only. Report error if unexpected write attempt.
```

### Wire custom shell wrapper

Create `.opencode/wrappers/deploy.sh`:

```bash
#!/bin/bash
# Vault injects env vars, runs command, clears env
eval $(opencode vault inject deploy --export)
$@
exit_code=$?
unset DEPLOY_TOKEN DEPLOY_HOST
exit $exit_code
```

AGENTS.md rule:

```
For any deploy operation, use: `.opencode/wrappers/deploy.sh <command>`
Never run raw deploy commands — deploy.sh handles credential injection+cleanup.
```

---

## Verification

```bash
# 1. Vault MCP running
opencode vault status
# Expected: "Vault MCP running. Local vault: OK. Env vault: OK."

# 2. Credential injection without exposure
opencode vault inject deploy --export
# Expected: exports DEPLOY_TOKEN and DEPLOY_HOST to shell
# Agent never reads these — only the shell process gets them

# 3. Permission prompt test
# In opencode session: "deploy the latest commit"
# Expected: vault asks "Allow deploy with DEPLOY_TOKEN?" → user approves → deploy runs

# 4. Denied operation test
opencode vault read --credential DATABASE_URL
# Expected: denied. Agent cannot read raw credentials.

# 5. Database MCP read-only test
opencode db query "DROP TABLE users"
# Expected: rejected with "Read-only mode. Write operations not allowed."
```

---

## Key Takeaways

- **Vault MCP never exposes credentials to LLM context** — the secret stays in the shell process
- **Agent sees command output, not credential values** — eliminates context-based secret leakage
- **Database MCP defaults read-only** — prevents accidental data modification
- **Custom wrappers run commands with injected+cleared env vars** — deploy scripts get credentials, agent doesn't
- **Permission prompt is the user's approval gate** — agent requests, user approves, vault injects
- **All vault operations are permission-auditable** — vault.yaml defines who can do what

---

## Common Misconception

"Putting secrets in environment variables is safe because the agent can't read them." — The agent CAN read environment variables via `env` command or `$VAR` in shell. Vault MCP blocks even this: it denies `read` operation and only allows `inject` for specific command contexts. The agent literally cannot access the secret's value through any tool — vault MCP enforces this at the access-control level, not just best-practice level.

---

## Feynman Explain

Explain the difference between "the agent can use a credential" and "the agent can see a credential." Why does this matter if we trust the LLM provider? (Answer: even if you trust Anthropic/OpenAI, your credentials are in a third-party context if the agent sees them. Vault MCP keeps them in your local process. The LLM says "run deploy" — vault injects credentials locally, runs the command, returns output. The LLM never transmitted, stored, or held the credential. Zero-trust architecture for AI-assisted ops.)

*When ready, run `learn.sh explain opencode-pro B1`.*

---

## Reframe

Vault MCP adds complexity: a new service to run, config to maintain, permission prompts on every deploy. Is this worth it for a solo developer on a side project? Where's the threshold where vault MCP becomes essential? (Answer: threshold is "would you be upset if this credential leaked." For personal projects with throwaway tokens, probably not. For production databases, paid API keys, or any credential that costs money or reputation: vault MCP is mandatory.)

---

## Drill

Run: `learn.sh quiz opencode-pro B1`
