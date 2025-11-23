```markdown
## Purpose & Overview

The `src/services/genArch.js` file contains functions to generate an architecture diagram for a given repository. It leverages the Google Gemini API to analyze a repository overview (located in `docs/OVERVIEW.md`) and create a Mermaid.js flowchart that visually represents the system's architecture. This generated diagram is then saved as `docs/ARCHITECTURE.md`.  The goal is to automate the creation of a high-level architectural overview document.

## Key Functions/Components

*   **`generateArchitectureDiagram(repo, overviewContent)`**: This is the core function. It takes the repository name (`repo`) and the content of the overview document (`overviewContent`) as input. It constructs a detailed prompt for the Gemini API, requesting a Mermaid.js flowchart that describes the system's architecture based on the provided information. The function then calls the Gemini API, parses the response to extract the Mermaid.js code, cleans the code by removing unnecessary markdown formatting, saves the code to `docs/ARCHITECTURE.md` wrapped in markdown code fences, and finally returns the cleaned Mermaid.js code.

*   **`generateArchitectureFromOverview(repo)`**: This function acts as a convenience wrapper for `generateArchitectureDiagram`.  It reads the repository overview content from `docs/OVERVIEW.md` and then calls `generateArchitectureDiagram` to generate and save the architecture diagram.  This function simplifies the process of creating the architecture diagram from the overview document.

## Business Logic (if applicable)

The business logic within `src/services/genArch.js` revolves around:

1.  **Prompt Engineering:** Crafting an effective prompt for the Gemini API to elicit the desired Mermaid.js output. The prompt includes instructions on the expected format, key architectural elements to highlight, and desired level of detail.

2.  **API Interaction:** Making a secure and authenticated request to the Gemini API using the `fetch` API.  It includes error handling to gracefully manage potential API failures.

3.  **Response Parsing:**  Extracting the Mermaid.js code from the potentially complex JSON response returned by the Gemini API. It handles cases where the expected response structure is not met.

4.  **Code Cleaning:** Removing any surrounding markdown code fences from the Mermaid.js output to ensure a clean and valid Mermaid.js code block is stored in the `ARCHITECTURE.md` file.

5.  **File System Interaction:** Reading the overview document from the file system and writing the generated architecture diagram to the file system.

## Input/Output Specifications

*   **`generateArchitectureDiagram(repo, overviewContent)`**

    *   **Input:**
        *   `repo` (string): The name of the repository.
        *   `overviewContent` (string): The content of the repository overview document (`docs/OVERVIEW.md`).
    *   **Output:**
        *   (string): The cleaned Mermaid.js code for the architecture diagram, or `null` if an error occurred.  Also saves the code to `docs/ARCHITECTURE.md`.

*   **`generateArchitectureFromOverview(repo)`**

    *   **Input:**
        *   `repo` (string): The name of the repository.
    *   **Output:**
        *   (void): This function does not return a value directly. It saves the generated architecture diagram to `docs/ARCHITECTURE.md` if successful.

## Usage Examples

To use this module, you would first need to create a `docs/OVERVIEW.md` file containing a description of your repository's architecture.  Then, you can import the `generateArchitectureFromOverview` function and call it with the repository name.

```javascript
import { generateArchitectureFromOverview } from './src/services/genArch.js';

async function main() {
  const repoName = "my-awesome-project"; // Replace with your repository name
  try {
    await generateArchitectureFromOverview(repoName);
    console.log("Architecture diagram generated successfully!");
  } catch (error) {
    console.error("Failed to generate architecture diagram:", error);
  }
}

main();
```

This code snippet demonstrates how to call `generateArchitectureFromOverview` to generate the architecture diagram based on the `docs/OVERVIEW.md` file. The result will be saved in `docs/ARCHITECTURE.md`.

## Dependencies

*   **fs (Node.js file system module):** Used for reading the overview file and writing the architecture diagram file.
*   **path (Node.js path module):** Used for constructing file paths.
*   **fetch (Global fetch API or a polyfill):** Used for making HTTP requests to the Gemini API.  Node.js 18+ includes `fetch` natively; older versions may require `node-fetch`.
*   **Google Gemini API:** The module relies on the Google Gemini API to generate the Mermaid.js code. The `GEMINI_API_KEY` environment variable must be set for authentication.

## Important Notes

*   **API Key Security:** Ensure that the `GEMINI_API_KEY` is stored securely as an environment variable and not directly in the code.
*   **Error Handling:**  The functions include error handling for API failures, file system errors, and unexpected response formats. The error messages are logged to the console.
*   **Rate Limiting:** Be mindful of the Gemini API's rate limits. Excessive calls to the API may result in throttling.
*   **Overview Content Quality:** The quality of the generated architecture diagram depends heavily on the content of the `docs/OVERVIEW.md` file. A well-structured and comprehensive overview will result in a more accurate and informative diagram.
*   **Mermaid.js Rendering:** The generated `ARCHITECTURE.md` file contains Mermaid.js code within markdown code fences.  To view the diagram visually, you'll need a tool or platform that supports Mermaid.js rendering, such as a Markdown editor with Mermaid.js support or a Mermaid.js live editor.
*   **Gemini API Costs:** Using the Gemini API may incur costs. Review the API's pricing details before using this module extensively.
*   **Experimental Nature:** The file includes "// demo" lines. Remove these before using in production. These may have been included for testing or debugging.
```