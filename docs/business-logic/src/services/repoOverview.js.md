```javascript
import fs from "fs";
import path from "path";

/**
 * @file src/services/repoOverview.js
 * @description This module provides functions to generate a repository overview document using the Gemini API.  It fetches the file structure from a GitHub repository, filters out irrelevant files, and then prompts the Gemini API to generate a Markdown overview document that describes the repository's structure, key components, entry points, technology stack, and setup instructions. The generated document is then saved to `docs/OVERVIEW.md`.
 */

// Files/folders to ignore
const IGNORED_PATTERNS = [
  /node_modules/,
  /\.git\//,
  /dist\//,
  /build\//,
  /\.next\//,
  /coverage\//,
  /\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/i,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.env/,
];

/**
 * Checks if a file should be included in the repository overview generation process.
 *
 * @function shouldIncludeFile
 * @param {string} filePath - The path to the file.
 * @returns {boolean} True if the file should be included, false otherwise.
 */
function shouldIncludeFile(filePath) {
  return !IGNORED_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Generates a repository overview document using the Gemini API and saves it to `docs/OVERVIEW.md`.
 *
 * @async
 * @function generateRepositoryOverview
 * @param {string} repo - The full name of the GitHub repository (e.g., "owner/repo").
 * @returns {Promise<Array<{path: string, name: string}>>} A promise that resolves to an array of file objects, each containing the path and name of a file in the repository that was included in the overview.
 * @throws {Error} If there is an error fetching data from GitHub or the Gemini API, or if the Gemini API returns an unexpected response format.
 */
export async function generateRepositoryOverview(repo) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
      "User-Agent": "ai-doc-bot",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Get default branch
    const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
    });
    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || "main";

    // Get tree SHA
    const branchResponse = await fetch(
      `https://api.github.com/repos/${repo}/branches/${defaultBranch}`,
      { headers }
    );
    const branchData = await branchResponse.json();
    const treeSha = branchData.commit.sha;

    // Get all files recursively
    const treeResponse = await fetch(
      `https://api.github.com/repos/${repo}/git/trees/${treeSha}?recursive=1`,
      { headers }
    );
    const treeData = await treeResponse.json();

    // Filter files
    const files = treeData.tree
      .filter((item) => item.type === "blob")
      .filter((item) => shouldIncludeFile(item.path))
      .map((item) => ({
        path: item.path,
        name: path.basename(item.path),
      }));

    console.log(`Found ${files.length} files`);

    // Generate overview
    const overview = await generateOverviewDocument(files, repo);

    // Save to docs/OVERVIEW.md
    const overviewPath = path.join(process.cwd(), "docs", "OVERVIEW.md");
    fs.writeFileSync(overviewPath, overview);

    console.log(`Overview saved to docs/OVERVIEW.md`);
    return files;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

/**
 * Generates the overview document content by prompting the Gemini API.
 *
 * @async
 * @function generateOverviewDocument
 * @param {Array<{path: string, name: string}>} files - An array of file objects, each containing the path and name of a file in the repository.
 * @param {string} repo - The full name of the GitHub repository (e.g., "owner/repo").
 * @returns {Promise<string>} A promise that resolves to the generated overview document content (Markdown).
 * @throws {Error} If the Gemini API returns an error or an unexpected response format.
 */
async function generateOverviewDocument(files, repo) {
  const fileList = files.map((f) => `- \`${f.path}\``).join("\n");

  const prompt = `Generate a repository overview for: ${repo}

Files (${files.length} total):
${fileList}

Provide:
# Repository Overview

## Project Structure
## Key Components
## Entry Points
## Technology Stack
## Setup Instructions

Format in markdown.`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data = await response.json();

  if (data.candidates && data.candidates[0]) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Unexpected response format from Gemini");
  }
}
```