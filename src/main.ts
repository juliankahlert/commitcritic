import * as core from "@actions/core";
import * as github from "@actions/github";

import { answer_workflow } from "./answer-workflow";
import { review_workflow_open, review_workflow_update } from "./review-workflow";

async function entry() {
  const event_name = github.context.eventName;

  switch (event_name) {
    case "pull_request_review_comment":
      core.info("Triggered by a PR review comment");
      await answer_workflow();
      break;
    case "pull_request":
      await handle_pr();
      break;
    default:
      core.warning(`Unknown or unhandled event: ${event_name}`);
      break;
  }
}

async function handle_pr() {
  const action = github.context.payload.action;

  switch (action) {
    case "opened":
      core.info("Triggered by a newly opened PR");
      await review_workflow_open();
      break;
    case "synchronize":
      core.info("Triggered by a newly pused commits on PR");
      await review_workflow_update();
      break;
    default:
      /* Don't handle:
       * edited: Rebase or metadata changed
       * closed: ...
       * reopened: ...
       */
      core.warning(`Unknown or unhandled event: ${action}`);
      break;
  }
}

entry();
