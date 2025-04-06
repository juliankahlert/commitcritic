export interface PRDetails {
  pull_number: number;
  description: string;
  title: string;
  owner: string;
  repo: string;
}

export interface Message {
  user: string;
  body: string;
}

export interface Discussion {
  thread: Array<Message>;
  remark: Message;
  context: string;
  line: number;
  file: string;
}

export interface DiscussionAnswer {
  remark_is_solved: boolean;
  answer: string;
}

export interface ReviewComment {
  body: string;
  line: number;
}

export interface PRComment {
  body: string;
  path: string;
  line: number;
}

export type Review = Array<PRComment>;

export interface AI {
  comment_on_pr(ai: AI, prompt: string): Promise<Array<ReviewComment> | null>;
  answer(ai: AI, prompt: string): Promise<DiscussionAnswer | null>;
  model: string;
  priv: Object;
}
