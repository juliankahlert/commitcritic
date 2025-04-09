import { Chunk, File } from "parse-diff";
import * as github from "../hoster/github";

export function review_prompt(file: File, chunk: Chunk, upstream: any): string {
  return `Your task is to review pull requests. Instructions:
  - Respond with a valid JSON object.
  - The JSON format must be: {"reviews": [{"line": <line_number>, "body": "<review comment>"}]}
  - Do not wrap the response in markdown code blocks (e.g., \`\`\`json ... \`\`\`).
  - Provide comments and suggestions ONLY if there is something to improve, otherwise "reviews" should be an empty array.
  - Write the comment in GitHub Markdown format.
  - Use the given description only for the overall context and only comment the code.
  - IMPORTANT: ONLY comment on issues that would cause the program to fail at runtime, lead to incorrect results, or violate the expected behavior of the application..
  - IMPORTANT: NEVER suggest adding comments to the code.
  
  Review the following code diff in the file "${
    file.to
  }" and take the pull request title and description into account when writing the response.
    
  Pull request title: ${github.pr_title(upstream)}
  Pull request description:
  
  ---
  ${github.pr_description(upstream)}
  ---
  
  Git diff to review:
  
  \`\`\`diff
  ${chunk.content}
  ${chunk.changes
    // @ts-expect-error - ln and ln2 exists where needed
    .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
    .join("\n")}
  \`\`\`
  `;
}
