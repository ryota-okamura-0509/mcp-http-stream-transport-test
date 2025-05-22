import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core';
import { MCPClient } from '@mastra/mcp';

// Create a client with an HTTP server (tries Streamable HTTP, falls back to SSE)
const httpClient = new MCPClient({
    servers: {
      myHttpClient: {
        url: new URL("http://localhost:3002/mcp"),// Use the base URL for Streamable HTTP
      },
    },
  });

console.log(httpClient.getTools());

export const MCPAgent = new Agent({
    name: "MCO Agent",
    instructions: "MCPサーバーを経由して、APIからクラス情報を取得するエージェントです。",
    model: openai('gpt-4o'),
    tools: await httpClient.getTools(),
  });