import { loadPrompt, render } from "./prompts.js";
import { runClaude } from "./claude.js";
import kleur from "kleur";

export type BuildOpts = {
  repoDir: string;
  model: string;
  toolUrl: string;
  tweetUrl?: string;
};

export async function runBuilder(opts: BuildOpts): Promise<void> {
  const tmpl = await loadPrompt("builder");
  const prompt = render(tmpl, {
    REPO_DIR: opts.repoDir,
    TOOL_URL: opts.toolUrl,
    TWEET_URL: opts.tweetUrl ?? "",
  });

  process.stdout.write(
    kleur.dim(`  [builder streaming output — this may take a few minutes]\n`),
  );

  await runClaude({
    prompt,
    cwd: opts.repoDir,
    addDir: opts.repoDir,
    model: opts.model,
    yolo: true,
    onStdout: (s) => process.stdout.write(kleur.dim(indent(s))),
    onStderr: (s) => process.stderr.write(kleur.red(indent(s))),
  });
}

function indent(s: string): string {
  return s.replace(/^/gm, "    ");
}
