# Granada

**English** · [繁體中文](README.zh-Hant.md) · [Website](https://daskinnyman.github.io/granada-release/)

A host-native software factory. You type one line of intent. The coding agent
already in your CLI (Claude Code, Codex or Cursor) takes it down a fixed track
of stations. At the end of the track is a merge-ready draft pull request.

https://github.com/user-attachments/assets/f7757fb8-f22f-4018-8ffb-7a45728ed1af

This repository holds Granada's public install artifacts (the Homebrew
formula, the curl installer and the website). The source repository is
private.

## How it works

Granada does not bring its own model. The agent you already use does the
thinking, and Granada keeps the work on a fixed track.

- **Granada owns the track.** It decides which station comes next, what each
  station must hand back, and the checks every answer has to pass. It records
  the run.
- **Your agent does the thinking.** At each agent station, the agent writes
  the answer. An answer that fails its check goes back to the agent.
- **Tool stations run on their own.** Worktree, tests, ship checks, quality,
  mutation, drift, merge and forge. Granada runs these itself.

Every station's output is a structured file that must pass its checks:
a schema, a test-first proof (the tests must fail on the old code first),
tests and ship checks, mutation testing on the changed lines, a code review
and a scope drift check.

## Three tracks

| Track       | Command              | What it does                                                                                     | Stations |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| `feature`   | `/granada-feature`   | Writes a spec in your repository's spec framework (or a short markdown spec), reviews it, and builds it in a worktree. | 28       |
| `patch`     | `/granada-patch`     | Fixes one bug. `reproduce` must see the bug before anything is fixed.                            | 19       |
| `bootstrap` | `/granada-bootstrap` | Creates a project from nothing. A large project starts as a runnable skeleton plus follow-up features. | 15       |

## You stay in charge

The track stops for you at a few points: clarify, sizing and the readable
spec on a feature run, triage on a patch, the charter and the architecture on
a bootstrap. Each decision gets one page: the decision and its risk first,
then the change in plain words, why it is made, what it touches, the change in
the order it is built, and the words it uses, explained.

Granada also records what each run cost and how each station did, and can
turn repeated failures from earlier runs into lessons that you approve.

## Install

Needs Node.js 22.12+ and one host CLI: Claude Code, Codex or Cursor.

### Let your agent set it up

In the repository where you want Granada, paste this line into your agent:

```text
Read https://daskinnyman.github.io/granada-release/setup-prompt.md and follow it.
```

It checks Node, installs Granada, runs `host sync` and `host doctor`, and asks
you before it commits.

### Homebrew

```bash
brew tap daskinnyman/granada https://github.com/daskinnyman/granada-release
brew install granada
```

Update with `brew upgrade granada` (or `granada update`).

### curl

```bash
curl -fsSL https://raw.githubusercontent.com/daskinnyman/granada-release/main/install.sh | bash
```

Puts `granada` on `PATH` at `~/.local/bin`. Pin a version with `GRANADA_VERSION=0.12.25`.

### Connect your host and run a track

```bash
granada host sync     # writes the skills, the MCP server entry and the Stop hook
granada host doctor   # checks that the host sees them
```

Commit the files that `host sync` wrote. Then start your host CLI in the
repository and type one of:

```text
/granada-feature add a dark mode toggle to the settings page
/granada-patch the login form crashes when the email is empty
/granada-bootstrap a command-line todo list in TypeScript
```

## Links

- [Website](https://daskinnyman.github.io/granada-release/) · [繁體中文網站](https://daskinnyman.github.io/granada-release/zh/)
- [Releases](https://github.com/daskinnyman/granada-release/releases)
- [`setup-prompt.md`](https://daskinnyman.github.io/granada-release/setup-prompt.md) · [`llms.txt`](https://daskinnyman.github.io/granada-release/llms.txt)

Named after a lunar crater city that builds machines.
