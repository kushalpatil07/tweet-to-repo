import { readFile } from "node:fs/promises";
import { fetchTweet } from "./fetchTweet.js";

export type Brief = {
  source: string;
  text: string;
  author?: string;
  tweetUrl?: string;
};

const TWEET_URL_RE =
  /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com|mobile\.twitter\.com)\/[^/]+\/status\/(\d+)/i;

export function isTweetUrl(s: string): boolean {
  return TWEET_URL_RE.test(s.trim());
}

export function tweetIdFromUrl(s: string): string | null {
  const m = s.trim().match(TWEET_URL_RE);
  return m ? m[1] : null;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

export type ResolveOpts = {
  positional?: string;
  filePath?: string;
};

export async function resolveBrief(opts: ResolveOpts): Promise<Brief> {
  if (opts.filePath) {
    const text = (await readFile(opts.filePath, "utf8")).trim();
    if (!text) throw new Error(`File is empty: ${opts.filePath}`);
    return { source: `file:${opts.filePath}`, text };
  }

  const arg = opts.positional?.trim();

  if (arg === "-" || (!arg && !process.stdin.isTTY)) {
    const text = await readStdin();
    if (!text) throw new Error("No input received on stdin.");
    return { source: "stdin", text };
  }

  if (!arg) {
    throw new Error(
      "No input. Pass a tweet URL, a quoted brief, `-` to read stdin, or --file <path>.",
    );
  }

  if (isTweetUrl(arg)) {
    const id = tweetIdFromUrl(arg)!;
    const tweet = await fetchTweet(id);
    return {
      source: `tweet:${id}`,
      text: tweet.text,
      author: tweet.author,
      tweetUrl: arg,
    };
  }

  return { source: "text", text: arg };
}
