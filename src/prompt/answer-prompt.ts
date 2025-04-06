import { Discussion } from "../interfaces";

export function answer_prompt(discussion: Discussion): string {
  return `Your task is to discuss remarks on pull requests. Instructions:
  - Respond with a valid JSON object.
  - The JSON format must be: {"remark_is_solved": <boolean>, "answer": "<review comment>"}
  - Do not wrap the response in markdown code blocks (e.g., \`\`\`json ... \`\`\`).
  - Discuss remarks and their solutions in a senior developer like way but be helpfull.
  - Write the comment in GitHub Markdown format.
  - Use the given description only for the overall context.
  - IMPORTANT: NEVER suggest adding comments to the code.
  
GitHub Review Discussion:
About diff-hunk in file ${discussion.file} line ${discussion.line}:
\`\`\`diff-hunk
${discussion.context}
\`\`\`
---
${discussion.remark.user}: ${discussion.remark.body}
${discussion.thread
  .map((comment) => `---\n${comment.user}: ${comment.body}`)
  .join("\n")}
`;
}
