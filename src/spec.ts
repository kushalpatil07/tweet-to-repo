import { loadPrompt, render } from "./prompts.js";
import { runClaude } from "./claude.js";
import type { Brief } from "./input.js";

export async function draftSpec(brief: Brief, model: string): Promise<string> {
  const tmpl = await loadPrompt("spec");
  const prompt = render(tmpl, {
    SOURCE: brief.source,
    AUTHOR: brief.author ?? "n/a",
    BRIEF: brief.text,
  });
  const out = await runClaude({ prompt, model, yolo: false });
  return stripFences(out).trim();
}

export function extractName(specMd: string): string | null {
  // ## Name\n<stuff>  — the first non-empty line under ## Name.
  const m = specMd.match(/##\s+Name\s*\n+([^\n]+)/i);
  if (!m) return null;
  const line = m[1].trim().replace(/^[`"']|[`"']$/g, "");
  // Accept only kebab-case tokens.
  const kebab = line.match(/[a-z0-9][a-z0-9-]*[a-z0-9]/i);
  return kebab ? kebab[0].toLowerCase() : null;
}

function stripFences(s: string): string {
  const fence = s.match(/^```(?:markdown|md)?\n([\s\S]*?)\n```\s*$/);
  return fence ? fence[1] : s;
}
