# Playbook C2: CI/CD with OpenCode

Est. study time: 2.5h
Language: en
Description: Plug opencode into GitHub Actions for automated PR review, changelog generation, and scheduled maintenance tasks. Wire opencode-scheduler for recurring agent jobs.

## Learning Objectives
- Set up GitHub Action that runs opencode PR review on every PR — CILO #8
- Configure changelog generation from agent session logs — CILO #8
- Deploy opencode-scheduler for nightly maintenance tasks — CILO #8
- Wire permission gating for CI agent (restricted vs interactive) — CILO #8

---

## Core Content

### The Problem: "Why can't the agent review PRs automatically?"

You review 10 PRs a day. Half are mechanical: lint, test coverage, type errors, missing edge cases. You spend 30 minutes writing "add error handling" and "test this branch."

OpenCode in CI runs as an automated reviewer. It checks the diff, runs your test suite, scans for security issues, and generates review comments — all without a developer behind the keyboard. It also generates changelogs from session logs, and runs scheduled maintenance (dep updates, dead code detection).

### CI Agent Architecture

```
GitHub PR
  └─ GitHub Action triggers
      └─ opencode CI agent (permission-restricted)
          ├─ Review: diff analysis + lint + test + security scan
          ├─ Comment: per-file findings
          └─ Label: "needs-review" / "approved" / "changes-requested"

GitHub Actions Schedule
  └─ opencode-scheduler
      └─ Nightly: dep upgrades, dead code scan, changelog generation
```

---

## Setup

### 1. GitHub Action for PR review

`.github/workflows/opencode-review.yml`:

```yaml
name: OpenCode PR Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: opencode/action@v1
        with:
          mode: review
          github-token: ${{ secrets.GITHUB_TOKEN }}
          config: |
            review:
              check:
                - lint: true
                - test: changed
                - security: true
                - conventional-commit: true
              format: "per-file"
```

### 2. Install opencode-scheduler

```bash
npm install -g opencode-scheduler
```

`opencode-scheduler.yaml`:

```yaml
jobs:
  changelog:
    schedule: "0 6 * * 1"  # Monday 6am
    command: "opencode changelog generate --since '1 week ago'"
    output: "CHANGELOG.md"

  deps:
    schedule: "0 5 * * 1"  # Monday 5am
    command: "npm outdated | opencode analyze --task 'upgrade safe deps'"

  dead-code:
    schedule: "0 7 1 * *"  # 1st of month
    command: "opencode analyze --task 'find dead code paths'"
```

---

## Wiring

### Wire CI agent with restricted permissions

CI agent must have different permission profile than interactive agent:

```opencode-ci.json
{
  "agent": {
    "build": {
      "permission": {
        "bash": {
          "npm test *": "allow",
          "npx eslint *": "allow",
          "git diff *": "allow",
          "git log *": "allow",
          "npm publish *": "deny",
          "git push *": "deny",
          "rm *": "deny"
        }
      }
    }
  },
  "review": {
    "max-comments": 10,
    "min-confidence": 0.8,
    "categories": ["bug", "security", "test-coverage", "style"]
  }
}
```

### Wire changelog generation

AGENTS.md rule:

```
## Changelog

After completing a feature or fix, the CI system runs changelog generation:
  - From commit messages (conventional commits)
  - From session logs (what was done, why)
  - AI categorizes: feat, fix, chore, refactor, docs, security
```

### Wire scheduler for maintenance

```bash
opencode-scheduler start --config opencode-scheduler.yaml
```

---

## Verification

```bash
# 1. PR review triggered
# Open a PR → check Actions tab
# Expected: OpenCode review runs, posts per-file comments

# 2. Review comment format
# Check PR comments from the action
# Expected: "src/auth.ts:12: <⚠️ security: Password logged in error handler. Fix: remove console.error(password)>"

# 3. Changelog generation
opencode changelog generate --since "1 week ago"
# Expected: markdown changelog with feat/fix/chore sections

# 4. Scheduler dry run
opencode-scheduler run --dry
# Expected: prints what jobs would run without executing

# 5. CI agent cannot push
# In CI environment, agent tries "git push"
# Expected: denied by permission policy
```

---

## Key Takeaways

- **OpenCode CI agent = automated PR reviewer** — catches bugs, security issues, test gaps before human review
- **CI agent has restricted permissions** — read-only diff, cannot push or publish
- **Changelog generated from commits + session logs** — AI categorizes into feat/fix/chore
- **opencode-scheduler runs recurring maintenance** — dep upgrades, dead code detection, changelog generation
- **CI review + human review = higher quality** — robot catches mechanical issues, human focuses on design
- **Setup is one YAML file** — no extra infra, runs on GitHub Actions runners

---

## Common Misconception

"Automated review will spam PRs with useless comments." — Configure `min-confidence: 0.8` and `max-comments: 10`. Only high-confidence findings are posted. Categories are configurable — turn off style if you use formatters. The CI agent should catch things humans miss (unused vars after refactor, security patterns, test coverage gaps) not nitpick formatting.

---

## Feynman Explain

Explain why the CI agent needs a different permission profile than interactive desktop opencode. What commands that are fine in interactive mode are dangerous in CI? (Answer: interactive agent has `git push: ask` — human approves. CI agent has `git push: deny` — no human watching. Same for `npm publish`, `rm -rf`, `git commit --amend`. CI permissions are read-only by default, with specific allow-listed write operations.)

*When ready, run `learn.sh explain opencode-pro C2`.*

---

## Reframe

A GitHub Action that runs an LLM on every PR costs money per review. Is the token cost worth it for repos with 50+ daily PRs? Where's the break-even point? Could you gate the action to only run on PRs with "needs-review" label?

---

## Drill

Run: `learn.sh quiz opencode-pro C2`
