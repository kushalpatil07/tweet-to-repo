# tweet-to-repo

Turn a tweet into an open-source GitHub repo. Autonomously.

[![CI](https://github.com/kushalpatil07/tweet-to-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/kushalpatil07/tweet-to-repo/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/tweet-to-repo.svg)](https://www.npmjs.com/package/tweet-to-repo)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

You paste a tweet URL. It drafts a spec, spins up an autonomous Claude Code
session in yolo mode, writes the code, and pushes a fresh public repo to your
GitHub. One command, one coffee, one new repo.

## Demo

```
$ tweet-to-repo "https://x.com/karpathy/status/1234567890123456789"

→ Resolving brief
  ✓ Got brief from tweet:1234567890123456789 (@karpathy)
  "someone should build a tiny cli that turns a folder of markdown into a…"

→ Drafting SPEC.md via claude
  ✓ Draft complete (2,184 chars)

? Scaffold at ./mdgrep? (Y/n) y

→ Scaffolding mdgrep
  ✓ Wrote SPEC.md and initialized git at ./mdgrep

→ Spawning autonomous builder (claude-opus-4-5, yolo mode)
  [builder streaming output — this may take a few minutes]
    ... builder writes files, runs tests, commits ...
  ✓ Build complete at ./mdgrep

→ Publishing to GitHub
  ✓ Pushed to https://github.com/kushalpatil07/mdgrep
```

## Why

Great tweets die in the replies. A thread like _"someone should just build X"_
gets 200 likes, zero repos. The barrier from _idea_ to _installable MVP_ is
mostly typing, and typing is a solved problem now. This tool collapses that gap:
brief in, working repo out, attribution preserved.

## Install

```bash
npm i -g tweet-to-repo
```

Or one-liner:

```bash
curl -fsSL https://raw.githubusercontent.com/kushalpatil07/tweet-to-repo/main/install.sh | sh
```

Prerequisites:

- **Node 20+**
- **[`claude`](https://claude.com/claude-code)** CLI, logged in
- **[`gh`](https://cli.github.com/)** CLI, authed (`gh auth login`) — only needed to actually push

## Quickstart

Any of these work:

```bash
# From a tweet URL
tweet-to-repo https://x.com/karpathy/status/1234567890

# From a plain-text brief
tweet-to-repo "a tiny cli that turns a folder of markdown into a searchable static site"

# From stdin (handy with pbpaste)
pbpaste | tweet-to-repo -

# From a file
tweet-to-repo --file idea.txt
```

## Usage

```
tweet-to-repo [input] [options]

Arguments:
  input                 Tweet URL, quoted brief, or '-' for stdin

Options:
  --file <path>         Read the brief from a local file
  --name <slug>         Override the inferred repo name (kebab-case)
  --dir <path>          Parent directory for the new repo (default: cwd)
  --private             Create the GitHub repo as private
  --yes                 Skip confirmation prompts
  --dry-run             Skip the `gh` push step
  --model <id>          Claude model to use (default: claude-opus-4-5)
  --skip-build          Scaffold SPEC.md only; don't run the builder
  -V, --version         Show version
  -h, --help            Show help
```

Inspect the plan before building:

```bash
tweet-to-repo "<brief>" --skip-build --dir /tmp
cat /tmp/<name>/SPEC.md
```

## How it works

```
  input ──►  resolve brief  ──►  draft SPEC.md  ──►  scaffold + git init  ──►
  ( url | text | stdin | file )     ( claude -p )       ( mkdir, SPEC.md )

     ──►  autonomous builder  ──►  gh repo create --push
         ( claude -p --dangerously-skip-permissions --add-dir <new repo> )
```

- **Tweet fetch** uses Twitter's public `cdn.syndication.twimg.com` endpoint —
  no API key, no OAuth.
- **Spec drafting** runs a normal `claude -p` with a structured prompt
  ([src/prompts/spec.md](src/prompts/spec.md)) that enforces a 9-section layout.
- **The build step** is the autonomy trick: we spawn `claude -p
  --dangerously-skip-permissions --add-dir <dir>` as a child process. Yolo mode
  is scoped to the new repo dir, not your whole machine. The parent CLI never
  runs in yolo mode itself.
- **Publishing** is a single `gh repo create --source=. --push` from inside the
  new repo.
- **Prompts are the IP.** [src/prompts/builder.md](src/prompts/builder.md) and
  [src/prompts/readme.md](src/prompts/readme.md) encode a non-negotiable
  quality bar — README structure, banned marketing words, a commit rule — so
  the output looks like a real project, not AI slop.

## Use as a Claude Code skill

If you already live in Claude Code, the installer drops a skill into
`~/.claude/skills/tweet-to-repo/`. Then:

```
/tweet-to-repo https://x.com/karpathy/status/123
```

See [.claude/skills/tweet-to-repo/SKILL.md](.claude/skills/tweet-to-repo/SKILL.md).

## Roadmap / Non-goals

**v1 (now):** single-tweet or single-brief input; spawn yolo claude in a scoped
dir; push to GitHub.

**Explicitly not doing:**

- Thread stitching. Single tweet or single brief only.
- Tweet media/image handling. Text only.
- Non-GitHub hosts (GitLab, Codeberg) — PRs welcome.
- A hosted web version. This stays a local CLI.

**Stretch ideas:** tweet-reply watcher ("@tweet-to-repo build this"), a
quality-scored registry of shipped repos, model routing (opus for spec, sonnet
for build).

## Contributing

Issues and PRs welcome — especially prompt tweaks in [src/prompts/](src/prompts/).
Please include a sample input and the before/after repo diff when proposing
changes there.

## License

MIT — see [LICENSE](LICENSE).

---

_Built to turn build-worthy tweets into real repos. The prompts are the product._
