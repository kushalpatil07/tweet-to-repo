---
name: tweet-to-repo
description: |
  Turn a tweet URL or a plain-text product brief into a brand-new open-source
  GitHub repo, fully implemented and pushed. Use when asked to "build this tweet",
  "turn this idea into a repo", "ship a project from this", or when the user
  pastes a tweet link and wants code.
allowed-tools:
  - Bash
  - Read
---

# tweet-to-repo

This skill shells out to the `tweet-to-repo` CLI, which spawns an autonomous
`claude --dangerously-skip-permissions` subprocess to scaffold and implement a
new repo from a tweet or brief.

## When to invoke

- User pastes a tweet URL and says "build this" / "make a repo for this".
- User gives a one-liner product idea and asks you to bootstrap a repo.
- User types `/tweet-to-repo <something>`.

## How to run

1. Check the CLI is installed:
   ```bash
   command -v tweet-to-repo
   ```
   If missing, run:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/kushalpatil07/tweet-to-repo/main/install.sh | sh
   ```
   or `npm i -g tweet-to-repo`.

2. Invoke with the user's input. Prefer passing the URL/brief as a single
   quoted arg. Always pass `--yes` so the CLI doesn't block on interactive
   confirmation — this skill is non-interactive.

   ```bash
   tweet-to-repo "<user input>" --yes
   ```

   Common flags:
   - `--private` — create the repo private.
   - `--dry-run` — don't push to GitHub; stop after local build.
   - `--dir <path>` — parent directory for the scaffold (default: cwd).
   - `--name <slug>` — override the inferred repo name.
   - `--model <id>` — override the Claude model (default: opus).

3. Stream the output to the user. The CLI prints clear step markers
   (`→ Resolving brief`, `→ Drafting SPEC.md`, etc.) and the final GitHub URL.

## Ground rules

- **Never** run `tweet-to-repo` without `--yes` from inside a skill — it will
  hang on the confirmation prompt.
- Don't try to re-implement what the CLI does by hand. The prompts baked into
  the CLI are tuned; going around them produces worse repos.
- If `gh` is missing or unauthed, the CLI will print instructions and exit
  cleanly. Surface those instructions to the user verbatim.
- If the user wants to inspect the plan before building, pass `--skip-build`
  — that scaffolds `SPEC.md` only and stops.

## Typical flow

```
user: /tweet-to-repo https://x.com/karpathy/status/123 — make it private
→ tweet-to-repo "https://x.com/karpathy/status/123" --private --yes
```

Report back with the final GitHub URL and a one-line summary of what was built.
