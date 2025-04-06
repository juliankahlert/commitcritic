import OpenAI from "openai";
import * as core from "@actions/core";

import { DiscussionAnswer, AI, ReviewComment } from "../interfaces";

export function new_openai(model: string) {
  const openai = new OpenAI({
    apiKey: core.getInput("OPENAI_API_KEY"),
  });

  const intf: AI = {
    comment_on_pr: openai_comment_on_pr,
    answer: openai_answer,
    priv: openai,
    model,
  };

  return intf;
}

async function openai_answer(
  ai: AI,
  prompt: string
): Promise<DiscussionAnswer | null> {
  const query_config = {
    model: ai.model,
    temperature: 0.2,
    max_tokens: 700,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  try {
    const openai: OpenAI = ai.priv as OpenAI;

    console.error("await openai.chat.completions");
    const response = await openai.chat.completions.create({
      ...query_config,
      // return JSON if the model supports it:
      ...{ response_format: { type: "json_object" } },
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    const res = response.choices[0].message?.content?.trim() || "{}";
    console.info("Raw OpenAI Response:", res);

    return JSON.parse(res) as DiscussionAnswer;
  } catch (error) {
    console.error("AI Review Error:", error);
    return null;
  }
}

async function openai_comment_on_pr(
  ai: AI,
  prompt: string
): Promise<Array<ReviewComment> | null> {
  const query_config = {
    model: ai.model,
    temperature: 0.2,
    max_tokens: 700,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  try {
    const openai: OpenAI = ai.priv as OpenAI;

    console.error("await openai.chat.completions");
    const response = await openai.chat.completions.create({
      ...query_config,
      // return JSON if the model supports it:
      ...{ response_format: { type: "json_object" } },
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    const res = response.choices[0].message?.content?.trim() || "{}";
    console.info("Raw OpenAI Response:", res);

    return JSON.parse(res).reviews as Array<ReviewComment>;
  } catch (error) {
    console.error("AI Review Error:", error);
    return null;
  }
}
