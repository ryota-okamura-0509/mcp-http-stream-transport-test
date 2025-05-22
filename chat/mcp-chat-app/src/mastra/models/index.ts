import { createOpenAI } from "@ai-sdk/openai";

const openAi = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
})

export const openAIEmbeddingModel = openAi.textEmbeddingModel('text-embedding-3-small');

