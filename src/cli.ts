#!/usr/bin/env node
import { Command } from "commander";
import kleur from "kleur";
import prompts from "prompts";
import { resolve, join } from "node:path";
import { access } from "node:fs/promises";
import { resolveBrief } from "./input.js";
import { draftSpec, extractName } from "./spec.js";
import { scaffoldEmptyRepo } from "./repo.js";
import { runBuilder } from "./build.js";
import { createAndPush, ghAuthed, hasGh } from "./github.js";
import { hasClaudeCli } from "./claude.js";
import { installSkill } from "./installSkill.js";

const TOOL_URL = "https://github.com/kushalpatil07/tweet-to-repo";
const DEFAULT_MODEL = "claude-opus-4-6";

const program = new Command();

program
  .name("tweet-to-repo")
  .description(
    "Turn a tweet (or any text brief) into an open-source GitHub repo, autonomously.",
  )
  .version("0.1.1");

program
  .command("install-skill")
  .description(
    "Install the Claude Code skill wrapper to ~/.claude/skills/tweet-to-repo/",
  )
  .option("-f, --force", "overwrite an existing skill file", false)
  .action(async (opts: { force: boolean }) => {
    try {
      console.log(kleur.bold().cyan("→ Installing tweet-to-repo skill"));
      await installSkill({ force: opts.force });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(kleur.red(`\nerror: ${msg}`));
      process.exit(1);
    }
  });

program
  .command("run", { isDefault: true })
  .description("Turn an input into a new open-source repo (default command)")
  .argument("[input]", "tweet URL, quoted brief, or '-' to read stdin")
  .option("--file <path>", "read the brief from a local file")
  .option("--name <slug>", "override the generated repo name (kebab-case)")
  .option("--dir <path>", "parent directory for the new repo", process.cwd())
  .option("--private", "create the GitHub repo as private", false)
  .option("--yes", "skip confirmation prompts", false)
  .option("--dry-run", "skip the `gh` push step", false)
  .option("--model <id>", "claude model to use", DEFAULT_MODEL)
  .option("--skip-build", "scaffold SPEC.md only, do not run the builder", false)
  .action(async (input: string | undefined, opts) => {
    try {
      await main(input, opts);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(kleur.red(`\nerror: ${msg}`));
      process.exit(1);
    }
  });

type Opts = {
  file?: string;
  name?: string;
  dir: string;
  private: boolean;
  yes: boolean;
  dryRun: boolean;
  model: string;
  skipBuild: boolean;
};

async function main(input: string | undefined, opts: Opts) {
  if (!(await hasClaudeCli())) {
    throw new Error(
      "`claude` CLI not found on PATH. Install from https://claude.com/claude-code.",
    );
  }

  // 1. Resolve brief
  step("Resolving brief");
  const brief = await resolveBrief({ positional: input, filePath: opts.file });
  ok(
    brief.author
      ? `Got brief from ${brief.source} (${brief.author})`
      : `Got brief from ${brief.source}`,
  );
  process.stdout.write(
    kleur.dim(`  "${truncate(brief.text.replace(/\s+/g, " "), 140)}"\n`),
  );

  // 2. Draft SPEC.md
  step("Drafting SPEC.md via claude");
  const specMd = await draftSpec(brief, opts.model);
  const inferredName = extractName(specMd);
  ok(`Draft complete (${specMd.length} chars)`);

  // 3. Confirm name + dir
  const name = opts.name ?? inferredName;
  if (!name) {
    throw new Error(
      "Could not infer a repo name from SPEC.md. Pass --name <slug>.",
    );
  }
  const repoDir = resolve(opts.dir, name);
  if (await exists(repoDir)) {
    throw new Error(`Target directory already exists: ${repoDir}`);
  }

  if (!opts.yes) {
    const { ok: confirmed } = await prompts({
      type: "confirm",
      name: "ok",
      message: `Scaffold at ${kleur.cyan(repoDir)}?`,
      initial: true,
    });
    if (!confirmed) {
      console.log(kleur.yellow("aborted."));
      return;
    }
  }

  // 4. Scaffold + git init
  step(`Scaffolding ${name}`);
  await scaffoldEmptyRepo(repoDir, specMd);
  ok(`Wrote SPEC.md and initialized git at ${repoDir}`);

  // 5. Run builder (optional)
  if (opts.skipBuild) {
    console.log(
      kleur.yellow(
        "\n--skip-build: stopping after SPEC.md. Run claude yourself in the new dir to continue.",
      ),
    );
    return;
  }

  step(`Spawning autonomous builder (${opts.model}, yolo mode)`);
  await runBuilder({
    repoDir,
    model: opts.model,
    toolUrl: TOOL_URL,
    tweetUrl: brief.tweetUrl,
  });
  ok(`Build complete at ${repoDir}`);

  // 6. Publish to GitHub
  if (opts.dryRun) {
    console.log(
      kleur.yellow(
        "\n--dry-run: skipping gh repo create. Push manually when ready.",
      ),
    );
    return;
  }

  if (!(await hasGh())) {
    console.log(
      kleur.yellow(
        "\n`gh` CLI not installed. Install from https://cli.github.com/ and run:\n" +
          `  cd ${repoDir} && gh repo create ${name} --public --source=. --push`,
      ),
    );
    return;
  }
  if (!(await ghAuthed())) {
    console.log(
      kleur.yellow(
        "\n`gh` is installed but not authed. Run `gh auth login` and then:\n" +
          `  cd ${repoDir} && gh repo create ${name} --public --source=. --push`,
      ),
    );
    return;
  }

  step(`Publishing to GitHub`);
  const url = await createAndPush(
    repoDir,
    name,
    opts.private ? "private" : "public",
  );
  ok(`Pushed to ${url}`);
}

function step(s: string) {
  console.log(kleur.bold().cyan(`\n→ ${s}`));
}
function ok(s: string) {
  console.log(kleur.green(`  ✓ ${s}`));
}
function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

program.parseAsync(process.argv);

// satisfy unused-import linter for join in future use
void join;
