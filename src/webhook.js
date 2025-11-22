import generateDocs from "./docGenerator.js";
import { extractChangedFiles } from "./gitUtils.js";

export default async function webhook(req, res) {
  const event = req.headers["x-github-event"];

  if (event !== "pull_request") {
    return res.status(200).send("Ignored event");
  }

  const action = req.body.action;
  if (action !== "closed" && action !== "synchronize") {
    return res.status(200).send("No action needed");
  }

  const repoInfo = {
    repo: req.body.repository.full_name,
    prNumber: req.body.pull_request.number,
  };

  const changedFiles = await extractChangedFiles(repoInfo);

  try {
    const changedFiles = await extractChangedFiles(repoInfo);
    await generateDocs(changedFiles);
    res.status(200).send("Docs updated");
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(500).send("Error processing webhook");
  }
}
