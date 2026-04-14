export type Tweet = {
  id: string;
  text: string;
  author: string;
  createdAt?: string;
};

// The syndication endpoint is the same public API Twitter's own embed widget
// uses. It expects a `token` derived deterministically from the tweet ID —
// algorithm pulled from the public embed JS.
function syndicationToken(id: string): string {
  const n = Number(id) / 1e15;
  return (n * Math.PI)
    .toString(6 ** 2)
    .replace(/(0+|\.)/g, "");
}

export async function fetchTweet(id: string): Promise<Tweet> {
  const token = syndicationToken(id);
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token}&lang=en`;
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) tweet-to-repo/0.1",
    },
  });
  if (!res.ok) {
    throw new Error(
      `Tweet fetch failed (${res.status}). The tweet may be private, deleted, or the syndication API changed. Try passing the tweet text directly instead.`,
    );
  }
  const data = (await res.json()) as {
    text?: string;
    user?: { screen_name?: string; name?: string };
    created_at?: string;
  };
  const text = (data.text ?? "").trim();
  if (!text) throw new Error("Tweet returned empty text.");
  const author =
    data.user?.screen_name ? `@${data.user.screen_name}` : (data.user?.name ?? "unknown");
  return { id, text, author, createdAt: data.created_at };
}
