import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import kleur from "kleur";

const here = dirname(fileURLToPath(import.meta.url));

// Find the bundled SKILL.md inside the installed npm package.
async function locateBundledSkill(): Promise<string> {
  const candidates = [
    // After build, copied into dist/skill/SKILL.md.
    join(here, "skill", "SKILL.md"),
    // Running from source (tsx dev).
    join(here, "..", ".claude", "skills", "tweet-to-repo", "SKILL.md"),
  ];
  for (const p of candidates) {
    try {
      await access(p);
      return p;
    } catch {
      // try next
    }
  }
  throw new Error(
    "Could not locate bundled SKILL.md. Reinstall: `npm i -g tweet-to-repo`.",
  );
}

export async function installSkill(opts: { force?: boolean }): Promise<void> {
  const src = await locateBundledSkill();
  const targetDir = join(homedir(), ".claude", "skills", "tweet-to-repo");
  const target = join(targetDir, "SKILL.md");

  // Warn if ~/.claude doesn't exist — probably means no Claude Code install.
  try {
    await access(join(homedir(), ".claude"));
  } catch {
    console.log(
      kleur.yellow(
        "  ! ~/.claude not found. Install Claude Code first: https://claude.com/claude-code",
      ),
    );
    console.log(kleur.yellow("    (Installing the skill anyway.)"));
  }

  if (!opts.force) {
    try {
      await access(target);
      console.log(
        kleur.yellow(
          `  ! Skill already exists at ${target}. Re-run with --force to overwrite.`,
        ),
      );
      return;
    } catch {
      // doesn't exist — proceed
    }
  }

  const body = await readFile(src, "utf8");
  await mkdir(targetDir, { recursive: true });
  await writeFile(target, body, "utf8");

  console.log(kleur.green(`  ✓ Installed skill to ${target}`));
  console.log(
    kleur.dim(
      "    Restart Claude Code (or open a new session) and invoke with /tweet-to-repo",
    ),
  );
}
