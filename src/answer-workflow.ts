import * as core from "@actions/core";
import { Discussion, Message, AI, DiscussionAnswer } from "./interfaces";
import { answer_prompt } from "./prompt/answer-prompt";
import { new_openai } from "./ai/openai";
import {
  init,
  review_comments,
  replies_to_comment,
  reply_to_comment,
} from "./hoster/github";

export async function answer_workflow() {
  const token = core.getInput("BOT_TOKEN");

  const hoster = await init(token);

  if (!hoster.inner.payload.comment) {
    core.setFailed("Missing comment in payload.");
    return;
  }

  const author = hoster.inner.payload.comment?.user?.login;
  core.info(`Comment made by: ${author}`);

  // do not answer yourself
  if (!author || !hoster.user?.login || author == hoster.user?.login) return;

  const comment = hoster.inner.payload.comment;
  const file = comment?.path;
  const line = comment?.original_line;
  const body = comment?.body;
  const pr = hoster.inner?.payload?.pull_request?.number;

  const comments = await review_comments(hoster, pr);

  core.info(`match diff hunk`);
  const thread =
    comments?.filter(
      (c) => c.path === comment.path && c.diff_hunk === comment.diff_hunk
    ) || [];

  if (thread.length <= 0) return;

  const remark = thread[0];
  const replies = await replies_to_comment(hoster, remark.id);

  const r: Array<Message> = [];
  replies.forEach((t) => {
    r.push({ user: t.user?.login, body: t.body });
  });

  const discussion: Discussion = {
    remark: { user: remark.user?.login, body: remark.body },
    context: comment.diff_hunk,
    line: line,
    file: file,
    thread: r,
  };

  const prompt = answer_prompt(discussion);
  core.info(prompt);

  const ai: AI = new_openai(core.getInput("OPENAI_API_MODEL"));

  const answer: DiscussionAnswer | null = await ai.answer(ai, prompt);
  const res = await reply_to_comment(hoster, pr, remark.id, answer?.answer);

  if (res) core.info(`Answer: ${answer?.answer}`);
  else core.error(`Failed to post reply`);
}
