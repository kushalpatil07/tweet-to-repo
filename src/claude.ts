import { spawn } from "node:child_process";

export type ClaudeRunOpts = {
  prompt: string;
  cwd?: string;
  addDir?: string;
  model?: string;
  yolo?: boolean;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
};

export async function runClaude(opts: ClaudeRunOpts): Promise<string> {
  const args: string[] = ["-p"];
  if (opts.yolo) args.push("--dangerously-skip-permissions");
  if (opts.addDir) args.push("--add-dir", opts.addDir);
  if (opts.model) args.push("--model", opts.model);
  args.push(opts.prompt);

  return await new Promise((resolve, reject) => {
    const child = spawn("claude", args, {
      cwd: opts.cwd ?? process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (b) => {
      const s = b.toString("utf8");
      stdout += s;
      opts.onStdout?.(s);
    });
    child.stderr.on("data", (b) => {
      const s = b.toString("utf8");
      stderr += s;
      opts.onStderr?.(s);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else
        reject(
          new Error(
            `claude exited ${code}\n--- stderr ---\n${stderr.trim() || "(empty)"}`,
          ),
        );
    });
  });
}

export async function hasClaudeCli(): Promise<boolean> {
  return await new Promise((resolve) => {
    const child = spawn("claude", ["--version"], { stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
