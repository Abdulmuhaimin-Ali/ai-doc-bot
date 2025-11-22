import fetch from "node-fetch";

export async function extractChangedFiles({ repo, prNumber }) {
  const url = `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`;

  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "ai-doc-bot",
    },
  });

  const files = await resp.json();

  return files.map((f) => ({
    filename: f.filename,
    patch: f.patch,
    status: f.status,
    raw_url: f.raw_url,
  }));
}
