import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

export async function scaffoldEmptyRepo(
  dir: string,
  specMd: string,
): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "SPEC.md"), specMd + "\n", "utf8");
  await gitInit(dir);
}

function gitInit(cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["init", "-q", "-b", "main"], {
      cwd,
      stdio: "ignore",
    });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`git init exited ${code}`)),
    );
  });
}
