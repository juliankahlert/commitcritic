import type { GitHub } from "@actions/github/lib/utils";
import { Context } from "@actions/github/lib/context";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { Review } from "../interfaces";

interface GitHubContext {
  octokit: InstanceType<typeof GitHub>;
  inner: Context;
  owner: string;
  repo: string;
  user: any;
}

export async function init(token: string): Promise<GitHubContext> {
  const octokit = github.getOctokit(token);
  const inner = github.context;

  const { owner, repo } = inner.repo;
  const { data: user } = await octokit.rest.users.getAuthenticated();

  return { octokit, inner, owner, repo, user } as GitHubContext;
}

export function pr_description(ctx: GitHubContext) {
  return ctx.inner.payload.pull_request?.body;
}

export function pr_title(ctx: GitHubContext) {
  return ctx.inner.payload.pull_request?.title || "Untitled";
}

export async function review_comments(
  ctx: GitHubContext,
  id: number | undefined
) {
  if (!id) return null;

  core.info(
    `Fetching review comments for PR #${id} in ${ctx.owner}/${ctx.repo}`
  );
  const { data: comments } = await ctx.octokit.rest.pulls.listReviewComments({
    owner: ctx.owner,
    repo: ctx.repo,
    pull_number: id,
  });

  return comments;
}

export async function replies_to_comment(ctx: GitHubContext, id: number) {
  const allComments: any[] = [];

  for await (const response of ctx.octokit.paginate.iterator(
    ctx.octokit.rest.pulls.listReviewCommentsForRepo,
    {
      owner: ctx.owner,
      repo: ctx.repo,
      per_page: 100,
    }
  )) {
    allComments.push(...response.data);
  }

  return allComments.filter((comment) => comment.in_reply_to_id === id);
}

export async function reply_to_comment(
  ctx: GitHubContext,
  pr_id: number | undefined,
  id: number | undefined,
  body: string | undefined
) {
  if (!pr_id || !id || !body) return false;

  const res = await ctx.octokit.rest.pulls.createReplyForReviewComment({
    owner: ctx.owner,
    repo: ctx.repo,
    pull_number: pr_id,
    comment_id: id,
    body,
  });

  return !!res;
}

export async function diff(
  ctx: GitHubContext,
  pr: number | undefined
): Promise<string | null> {
  if (!pr) return null;

  const response = await ctx.octokit.rest.pulls.get({
    owner: ctx.owner,
    repo: ctx.repo,
    pull_number: pr,
    mediaType: { format: "diff" },
  });

  // @ts-expect-error - response.data is a string
  return response.data;
}

export async function compare(
  ctx: GitHubContext,
  base: string | undefined,
  head: string
): Promise<string | null> {
  const response = await ctx.octokit.rest.repos.compareCommits({
    headers: {
      accept: "application/vnd.github.v3.diff",
    },
    owner: ctx.owner,
    repo: ctx.repo,
    base: base || "undefined",
    head,
  });

  return String(response.data);
}

export async function post_review(
  ctx: GitHubContext,
  pr: number | undefined,
  comments: Review
): Promise<void> {
  if (!pr) return;

  await ctx.octokit.rest.pulls.createReview({
    owner: ctx.owner,
    repo: ctx.repo,
    pull_number: pr,
    comments,
    event: "COMMENT",
  });
}
