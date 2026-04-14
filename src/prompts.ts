import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

export async function loadPrompt(name: "spec" | "builder" | "readme"): Promise<string> {
  // After build, prompts live at dist/prompts/<name>.md (copied by `npm run build`).
  // In dev (tsx), prompts live at src/prompts/<name>.md.
  const candidates = [
    join(here, "prompts", `${name}.md`),
    join(here, "..", "src", "prompts", `${name}.md`),
  ];
  for (const p of candidates) {
    try {
      return await readFile(p, "utf8");
    } catch {
      // try next
    }
  }
  throw new Error(`Could not locate prompt: ${name}.md`);
}

export function render(tmpl: string, vars: Record<string, string>): string {
  return tmpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}
