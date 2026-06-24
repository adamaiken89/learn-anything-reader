# Playbook C1: Team Config as Code

Est. study time: 2h
Language: en
Description: Share opencode config, tools, and skills across the team via VCS. Use ocx profiles for multi-project setups and remote defaults for onboarding.

## Learning Objectives
- Structure .opencode/ directory for team sharing via VCS — CILO #7
- Create ocx profiles for multi-project developer setups — CILO #7
- Implement remote default configs for zero-friction onboarding — CILO #7
- Manage team skills and tools as version-controlled packages — CILO #7

---

## Core Content

### The Problem: "Every dev configures opencode differently"

Developer A has rtk + headroom. Developer B has raw grep. Developer C has custom tools from last month's experiment. PRs from Dev C fail lint because their agent doesn't know the team's code conventions. Onboarding takes half a day of "let me show you my config."

Team config as code fixes this: the entire `.opencode/` directory is shared via git. AGENTS.md, custom tools, skills, and permissions — all version-controlled. Clone the repo, run `opencode`, and you have the team's harness.

### The Team Config Structure

```
project/
├── .opencode/
│   ├── config.yaml           # Shared opencode config
│   ├── permissions.yaml      # Team permission policies
│   ├── tools/                # Version-controlled custom tools
│   │   ├── gen-test.ts
│   │   ├── deploy-check.ts
│   │   └── review-pr.ts
│   ├── skills/               # Team-specific skills
│   │   ├── codebase-investigation.md
│   │   ├── security-audit.md
│   │   └── deploy-prep.md
│   └── profiles/             # ocx profiles for different contexts
│       ├── default.yaml
│       ├── frontend.yaml
│       └── backend.yaml
├── AGENTS.md                 # Team harness rules
└── opencode.json             # Team base config
```

---

## Setup

### 1. Initialize shared config

```bash
opencode /init --shared
```

Creates `.opencode/` with team-layout structure.

### 2. Configure opencode.json for team

```json
{
  "agent": {
    "build": {
      "permission": {
        "bash": {
          "rtk *": "allow",
          "codegraph *": "allow",
          "git add *": "allow",
          "git commit *": "allow",
          "git push *": "ask",
          "gh pr create *": "ask"
        }
      }
    }
  },
  "tools": {
    "dir": ".opencode/tools",
    "auto-load": true
  },
  "mcpServers": {
    "vault": {
      "command": "opencode-vault-mcp",
      "args": ["--config", "~/.opencode/vault.yaml"]
    }
  }
}
```

Commit to git. Every team member gets identical permissions and tool loading.

### 3. Create ocx profiles

Define different config profiles for different project contexts:

`.opencode/profiles/frontend.yaml`:
```yaml
extends: default
plugins:
  - oh-my-opencode
tools:
  - gen-component
  - gen-test
```

`.opencode/profiles/backend.yaml`:
```yaml
extends: default
plugins:
  - oh-my-opencode
tools:
  - gen-service
  - db-migration
  - deploy-check
```

Switch profiles:
```bash
ocx use frontend
ocx use backend
```

---

## Wiring

### Wire remote config for onboarding

```bash
# New hire: one command to get team config + harness
opencode setup --from github.com/team/opencode-config
```

This pulls the team's `.opencode/`, `AGENTS.md`, and `opencode.json` from a central repo, merged with project-local config.

### Wire skills as VCS packages

Store team skills in a shared repo:

```
github.com/team/opencode-skills/
├── skills/
│   ├── code-review.yaml
│   ├── security-audit.yaml
│   └── onboarding.yaml
└── package.json
```

Install:
```bash
opencode skill add @team/code-review
```

---

## Verification

```bash
# 1. Config inheritance
opencode config show
# Expected: shows merged team config + project config + personal config

# 2. Profile switch
ocx use frontend
opencode tools
# Expected: only frontend tools listed

ocx use backend
opencode tools
# Expected: backend tools listed

# 3. Config from remote
opencode setup --from github.com/team/opencode-config
# Expected: fetches and merges team config

# 4. Fresh clone → agent uses team conventions
git clone project && cd project && opencode
# Ask: "run lint"
# Expected: agent uses team's lint command (not guessed)
```

---

## Key Takeaways

- **.opencode/ in VCS means team-wide consistency** — clone and go
- **ocx profiles let one developer switch between project contexts** — frontend vs backend configs
- **Remote config = zero-friction onboarding** — new hires get team harness in one command
- **Skills as packages** — team conventions distributed via package manager
- **Config inheritance** — personal overrides on top of team defaults, never conflicts
- **No more "my agent works differently"** — shared config = shared agent behavior

---

## Common Misconception

"Shared config is too rigid — developers need flexibility." — Config inheritance handles this. Team defaults apply to all. Individual `~/.opencode/personal.yaml` overrides specific settings. Vault credentials stay local. Tools are shared, but each dev controls their vault MCP user config.

---

## Feynman Explain

Explain why storing `.opencode/` in git is more effective than a shared Google Doc titled "OpenCode Setup Guide." (Answer: Docs drift. Nobody updates them. Config in git is tested by every PR, reviewed by the team, and applied automatically on `opencode`. It's executable documentation — the agent reads it every turn.)

*When ready, run `learn.sh explain opencode-pro C1`.*

---

## Reframe

ocx profiles for frontend vs backend contexts — is this overengineering for a small team? What's the minimum team size where profiles become worth the overhead? When would a single profile suffice?

---

## Drill

Run: `learn.sh quiz opencode-pro C1`
