import OpenAI from "openai";
import { textStreamResponse } from "@/utils/textStreamResponse";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  const {
    messages,
    model,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
  } = await req.json();

  const response = await openai.chat.completions.create({
    stream: true,
    model: model || "llama3.2",  // Use the env variable, fallback to llama3.2
    temperature: temperature,
    max_tokens: max_tokens,
    top_p: top_p,
    frequency_penalty: frequency_penalty,
    presence_penalty: presence_penalty,
    messages: messages,
  }, { signal: req.signal });

  async function* text() {
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta.content;
      if (content) yield content;
    }
  }

  return textStreamResponse(text(), () => response.controller.abort());
}
