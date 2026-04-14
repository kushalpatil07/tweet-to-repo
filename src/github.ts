import { spawn } from "node:child_process";

function run(
  cmd: string,
  args: string[],
  cwd?: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (b) => (stdout += b.toString("utf8")));
    child.stderr.on("data", (b) => (stderr += b.toString("utf8")));
    child.on("error", reject);
    child.on("close", (code) =>
      resolve({ code: code ?? 1, stdout, stderr }),
    );
  });
}

export async function hasGh(): Promise<boolean> {
  try {
    const { code } = await run("gh", ["--version"]);
    return code === 0;
  } catch {
    return false;
  }
}

export async function ghAuthed(): Promise<boolean> {
  try {
    const { code } = await run("gh", ["auth", "status"]);
    return code === 0;
  } catch {
    return false;
  }
}

export async function createAndPush(
  repoDir: string,
  name: string,
  visibility: "public" | "private",
): Promise<string> {
  const vis = visibility === "public" ? "--public" : "--private";
  const { code, stdout, stderr } = await run(
    "gh",
    ["repo", "create", name, vis, "--source", repoDir, "--remote", "origin", "--push"],
    repoDir,
  );
  if (code !== 0) {
    throw new Error(`gh repo create failed:\n${stderr || stdout}`);
  }
  const urlMatch = stdout.match(/https:\/\/github\.com\/[^\s]+/);
  return urlMatch ? urlMatch[0] : `https://github.com/?/${name}`;
}
