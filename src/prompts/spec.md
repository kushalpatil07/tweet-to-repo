You are a senior product engineer. Turn the following brief into a crisp MVP spec for a new open-source repo. Your output will be saved as `SPEC.md` at the root of a fresh repo and handed to another engineer to implement autonomously — so it must be unambiguous, self-contained, and narrow.

# Brief

Source: {{SOURCE}}
Author: {{AUTHOR}}

```
{{BRIEF}}
```

# Instructions

Produce a `SPEC.md` with **exactly** these H2 sections, in this order:

## Name
A kebab-case product name. Short, memorable, pronounceable. No numerics unless meaningful. No "ai-" or "gpt-" prefixes unless the product is literally a model.

## Pitch
A single line, under 80 characters, concrete. No buzzwords. "X for Y" framing is fine when it's genuinely clarifying.

## Problem
2–4 sentences. Who hurts, what they try today, why it's not good enough. Written for a skeptical reader.

## MVP scope
A bulleted list of **at most 5** features. Each must be shippable in under ~500 lines of code. Order by what unlocks the "aha" moment first. Mark anything non-essential as `[stretch]` and move it to the Stretch section instead.

## Non-goals
Explicit list of what this is **not** doing in v1. Be opinionated — "no auth", "no multi-user", "no cloud", "no plugin system".

## Stack
Pick the smallest stack that works. Default preferences, in order:
1. Single-binary CLI in TypeScript (Node 20+), Python (3.11+, uv/pipx), or Go.
2. Static site in vanilla HTML + a sprinkle of TS, no framework.
3. Only reach for React/Next/Svelte/etc. if the product is fundamentally a rich interactive UI.
Justify the choice in one sentence. Name exact runtime versions and the 2–4 libraries you'll depend on.

## File layout
A tree showing the proposed repo structure. Include every file that will exist at v1 ship.

## UX sketch
A fenced code block showing exactly what the user sees — CLI transcript, or an ASCII screen mock for UIs. Concrete inputs, concrete outputs. No ellipses.

## Stretch
Exactly 3 bullets tagged `[stretch]`. Ideas for v2+, explicitly out of scope now.

# Guardrails

- If the brief is ambiguous, pick the **most interesting narrow interpretation** and add a one-line `> Assumption:` quote under Problem.
- No emojis anywhere in SPEC.md.
- No marketing voice. No "revolutionary", "seamless", "blazing-fast", "game-changing".
- Prefer concrete examples over abstractions.
- Output only the SPEC.md markdown content. No preamble, no closing commentary.
