# README rubric

The README is the repo's landing page. Assume readers bounce in under 10 seconds. Optimize for: *what is this, does it solve my problem, how do I try it in one line.*

## Required sections, in order

### 1. Title + pitch
```markdown
# product-name

One-line pitch from SPEC.md — under 80 chars, concrete, no buzzwords.
```

### 2. Badges (optional, only if real)
CI status, published package version, license. Never fake a badge. If you don't have CI set up yet, skip.

### 3. Demo
Either:
- `![demo](docs/demo.gif)` with an HTML comment explaining how to record it, OR
- A fenced terminal block showing real output from the quickstart command.

Never both. Never a placeholder screenshot.

### 4. Why
2–3 sentences. Human framing of the problem. No tech yet.

### 5. Install
One line. Must actually work.

```bash
npm i -g product-name
# or
brew install product-name
# or
pipx install product-name
```

If the package is not yet published, use the `git clone` path and mark it "pre-release":

```bash
git clone https://github.com/OWNER/product-name && cd product-name && npm i && npm link
```

### 6. Quickstart
The one command that delivers the aha moment, followed by its real output in a fenced block.

```bash
product-name <realistic-input>
```
```
<real output here>
```

### 7. Usage
All commands and flags. One realistic example per flag. Group by subcommand if applicable.

### 8. How it works
3–5 bullets, or a 6-line ASCII diagram. Mechanism. No marketing.

### 9. Roadmap / Non-goals
Pulled straight from SPEC.md's MVP + Non-goals + Stretch.

### 10. Contributing
One short paragraph. Point at issues + PRs. Link `CONTRIBUTING.md` only if it actually exists.

### 11. License
One line: `MIT — see [LICENSE](LICENSE).`

### 12. Footer
```markdown
---
_Bootstrapped from a tweet via [tweet-to-repo](https://github.com/OWNER/tweet-to-repo)._
```
If the source was a tweet URL, include it: `_Source: [@author's tweet](URL)._`

## Banned

- Emoji stacks in headings (`## 🚀 Features`).
- Adjectives without evidence ("blazing fast", "beautifully designed").
- "Coming soon" sections without a date.
- Ascii art banners at the top.
- Tables of contents for READMEs under 200 lines.
- A features section that's just a re-list of the Usage section.

## Voice

Plain, confident, terse. Present tense. Show, don't tell — prefer a code block over an adjective. If a sentence doesn't add new information, delete it.
