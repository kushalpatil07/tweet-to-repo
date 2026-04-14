#!/usr/bin/env bash
# tweet-to-repo installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/kushalpatil07/tweet-to-repo/main/install.sh | sh
#
# Installs the `tweet-to-repo` CLI globally via npm and, if `~/.claude/skills`
# exists, drops in the Claude Code skill wrapper too.

set -euo pipefail

REPO="kushalpatil07/tweet-to-repo"
PKG="tweet-to-repo"

say()  { printf "\033[1;36m→\033[0m %s\n" "$*"; }
ok()   { printf "\033[1;32m✓\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m!\033[0m %s\n" "$*"; }
die()  { printf "\033[1;31m✗\033[0m %s\n" "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "node is required (>=20). Install from https://nodejs.org/"
command -v npm  >/dev/null 2>&1 || die "npm is required. Install Node from https://nodejs.org/"

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt 20 ]; then
  die "node >= 20 required (got $(node -v))"
fi

say "Installing $PKG globally via npm"
npm install -g "$PKG" >/dev/null
ok "$PKG $(npm -g ls $PKG --depth=0 2>/dev/null | awk "/$PKG/ {print \$NF}") installed"

# Skill wrapper (optional)
if [ -d "${HOME}/.claude/skills" ]; then
  SKILL_DIR="${HOME}/.claude/skills/tweet-to-repo"
  say "Installing Claude Code skill to $SKILL_DIR"
  mkdir -p "$SKILL_DIR"
  curl -fsSL "https://raw.githubusercontent.com/${REPO}/main/.claude/skills/tweet-to-repo/SKILL.md" \
    -o "$SKILL_DIR/SKILL.md"
  ok "Skill installed — invoke with /tweet-to-repo in Claude Code"
else
  warn "~/.claude/skills not found — skipping skill install"
fi

# Doctor
say "Checking prerequisites"
if command -v claude >/dev/null 2>&1; then
  ok "claude CLI found ($(claude --version 2>/dev/null | head -n1))"
else
  warn "claude CLI not found — install from https://claude.com/claude-code"
fi
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    ok "gh CLI authed"
  else
    warn "gh found but not authed — run: gh auth login"
  fi
else
  warn "gh CLI not found — install from https://cli.github.com/"
fi

echo
ok "Done. Try it:"
echo "  tweet-to-repo \"a tiny cli that turns a folder of markdown into a searchable static site\" --dry-run"
