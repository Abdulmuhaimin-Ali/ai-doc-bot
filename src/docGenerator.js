import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function generateDocs(changedFiles) {
  const docsDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);

  for (const file of changedFiles) {
    const contentResp = await fetch(file.raw_url);
    const code = await contentResp.text();

    const doc = await callAIToGenerateDoc(code, file.filename);

    const docPath = path.join(docsDir, `${file.filename}.md`);
    fs.writeFileSync(docPath, doc);
  }
}

async function callAIToGenerateDoc(code, filename) {
  const prompt = `
Generate updated documentation for the following file: ${filename}.

Here is the current content:
${code}
  `;

  const response = await fetch(process.env.AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return data.output;
}
