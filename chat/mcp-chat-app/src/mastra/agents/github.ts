import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { cloneRepositoryTool } from "../tools/github/cloneRepository";

export const githubAnalysisAgent = new Agent({
    name: "GitHub Analysis Agent",
    instructions: "GitHubリポジトリを解析するエージェントです。リポジトリのURLを指定すると、それをクローンして解析できます。",
    model: openai('gpt-4o'),
    tools: {
      cloneRepositoryTool
    }
  });