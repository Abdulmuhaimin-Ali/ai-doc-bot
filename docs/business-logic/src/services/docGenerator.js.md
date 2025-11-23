```javascript
/**
 * @file src/services/docGenerator.js
 * @description This module provides functionality to automatically generate documentation for code files using the Gemini AI model.  It fetches file content, categorizes the file based on its code, calls the AI model to generate documentation, and then saves the generated documentation to a structured directory within the `docs` folder.
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

/**
 * Generates documentation for a list of changed files.
 *
 * @async
 * @function generateDocs
 * @param {Array<Object>} changedFiles - An array of objects representing the changed files.  Each object is expected to have a `filename` property (the file name) and a `raw_url` property (the URL to fetch the raw content of the file).
 * @returns {Promise<void>} - A promise that resolves when all documentation has been generated.  No specific value is returned.
 *
 * @throws {Error} Will throw an error if the AI service fails to generate documentation. Errors are logged to the console and a default error message is written to the document.
 *
 * @example
 * // Example usage:
 * const changedFiles = [
 *   { filename: 'user.js', raw_url: 'https://example.com/raw/user.js' },
 *   { filename: 'auth.js', raw_url: 'https://example.com/raw/auth.js' },
 * ];
 * await generateDocs(changedFiles);
 */
export default async function generateDocs(changedFiles) {
  const docsBaseDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsBaseDir)) fs.mkdirSync(docsBaseDir);

  console.log(
    " Changed files:",
    changedFiles.map((f) => f.filename)
  );

  for (const file of changedFiles) {
    const contentResp = await fetch(file.raw_url);
    const code = await contentResp.text();

    // get category from AI
    const category = await categorizeFile(code, file.filename);
    console.log(`Categorized ${file.filename} as ${category}`);

    const doc = await callAIToGenerateDoc(code, file.filename, category);

    // Create organized file structure
    const docPath = path.join(docsBaseDir, category, `${file.filename}.md`);

    const docDir = path.dirname(docPath);

    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
      console.log(` Created directory: ${docDir}`);
    }

    fs.writeFileSync(docPath, doc);
    console.log(`  Documentation generated: ${docPath}`);
  }
}

/**
 * Categorizes a code file using the Gemini AI model.
 *
 * @async
 * @function categorizeFile
 * @param {string} code - The code content of the file.
 * @param {string} filename - The name of the file.
 * @returns {Promise<string>} - A promise that resolves with the category of the file.  Possible categories are: 'business-logic', 'api-routes', 'database', and 'uncategorized' (if categorization fails).
 *
 * @throws {Error}  Will throw an error if the Gemini API returns an error, or if the response is in an unexpected format. Errors are logged to the console, and the function returns 'uncategorized' in case of an error.
 *
 * @example
 * // Example usage:
 * const category = await categorizeFile("function addUser() { ... }", "user.js");
 * console.log(category); // Output: business-logic (or another valid category)
 */
async function categorizeFile(code, filename) {
  try {
    const prompt = `You must return ONLY a single word from this exact list:
- business-logic
- api-routes
- database

File: ${filename}
Code:
${code}

Return ONLY the category word. Do not include any other text, explanation, or punctuation.`;

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
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 20,
          },
        }),
      }
    );

    const data = await response.json();
    const rawCategory = data.candidates[0].content.parts[0].text;
    console.log("Raw AI response:", rawCategory);

    // Clean up the response aggressively
    const category = rawCategory
      .trim()
      .toLowerCase()
      .replace(/[^a-z-]/g, "") // Remove everything except letters and hyphens
      .split("\n")[0]; // Take only first line if multiple

    // Validate against allowed categories
    const validCategories = ["business-logic", "api-routes", "database"];
    if (!validCategories.includes(category)) {
      console.warn(
        `Invalid category "${category}", defaulting to uncategorized`
      );
      return "uncategorized";
    }
    return category;
  } catch (error) {
    console.error("Error categorizing file:", error);
    return "uncategorized";
  }
}

/**
 * Calls the Gemini AI model to generate documentation for a code file.
 *
 * @async
 * @function callAIToGenerateDoc
 * @param {string} code - The code content of the file.
 * @param {string} filename - The name of the file.
 * @param {string} category - The category of the file (e.g., 'business-logic', 'api-routes', 'database').
 * @returns {Promise<string>} - A promise that resolves with the generated documentation in Markdown format.  If documentation generation fails, a default error message is returned.
 *
 * @throws {Error} Will throw an error if the Gemini API returns an error or if the response is in an unexpected format.  Errors are logged to the console, and a default error message is returned as the documentation in case of an error.
 *
 * @example
 * // Example usage:
 * const doc = await callAIToGenerateDoc("function addUser() { ... }", "user.js", "business-logic");
 * console.log(doc); // Output: The generated documentation in Markdown format.
 */
async function callAIToGenerateDoc(code, filename, category) {
  try {
    const prompt = `
Generate comprehensive documentation for this ${category} file: ${filename}

Code:
${code}

Please provide:
## Purpose & Overview
## Key Functions/Components
## Business Logic (if applicable)
## Input/Output Specifications
## Usage Examples
## Dependencies
## Important Notes

Format in clear markdown with appropriate headers.
`;

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
      throw new Error(`AI service responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini");
    }
  } catch (error) {
    console.error("Error calling AI service:", error);
    return `# Documentation Generation Failed\n\nError: ${error.message}`;
  }
}
```