import * as core from "@actions/core";
import * as remote from "./hoster/github";
import minimatch from "minimatch";
import parseDiff, { Chunk, File } from "parse-diff";
import { review_prompt } from "./prompt/review-prompt";
import { new_openai } from "./ai/openai";
import { AI, ReviewComment, Review, PRComment } from "./interfaces";

export async function review_workflow_open() {
  const token = core.getInput("BOT_TOKEN");

  const repo = await remote.init(token);
  const pr = repo.inner?.payload?.pull_request?.number;

  if (!pr) return;

  const diff = await remote.diff(repo, pr);

  return await review(repo, pr, diff);
}

export async function review_workflow_update() {
  const token = core.getInput("BOT_TOKEN");

  const repo = await remote.init(token);
  const pr = repo.inner?.payload?.pull_request?.number;

  const head = repo.inner?.payload?.pull_request?.head?.sha;
  const base = repo.inner?.payload?.before;

  if (!pr || !head) return;

  core.info(`Compare base ${base} with head: ${head}`);
  const diff = await remote.compare(repo, base, head);

  return await review(repo, pr, diff);
}

async function review(repo: any, pr: number, diff: string | null) {
  if (!diff) {
    core.error("No diff found");
    return null;
  }

  const parsed_diff = parseDiff(diff);

  const exclude_patterns = core
    .getInput("exclude")
    .split(",")
    .map((s) => s.trim());

  const filtered_diff = parsed_diff.filter((file) => {
    return !exclude_patterns.some((pattern) =>
      minimatch(file.to ?? "", pattern)
    );
  });

  const rev = await analyze_pr(filtered_diff, repo);
  if (rev.length > 0) await remote.post_review(repo, pr, rev);
}

async function analyze_pr(parsed_diff: File[], repo: any): Promise<Review> {
  const comments: Review = [];
  const ai: AI = new_openai(core.getInput("OPENAI_API_MODEL"));

  for (const file of parsed_diff) {
    // Ignore deleted files
    if (file.to === "/dev/null") continue;

    for (const chunk of file.chunks) {
      const prompt = review_prompt(file, chunk, repo);
      core.info(`----- Prompt -----`);
      core.info(prompt);
      const responses = await ai.comment_on_pr(ai, prompt);
      if (!responses) {
        core.error(`Failed to review chunk:\n${chunk}`);
        continue;
      }

      const new_comments = responses_to_comments(file, responses);
      comments.push(...new_comments);
    }
  }
  return comments;
}

function responses_to_comments(
  file: File,
  responses: Array<ReviewComment>
): Review {
  if (!file.to) return [];

  core.info(JSON.stringify(responses));

  return responses.map((response) => {
    return {
      body: response.body,
      path: file.to,
      line: Number(response.line),
    } as PRComment;
  });
}
