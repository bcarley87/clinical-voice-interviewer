import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { TranscriptMessage } from "@/hooks/useRealtimeSession";

export const maxDuration = 60;

const FORMAT_PROMPT = `You are a clinical note formatter. You will receive a physician's spoken transcript from a voice dictation session.

Your ONLY jobs are:
1. Organize the physician's spoken content into two sections: HPI and Assessment & Plan
2. Fix spelling errors only

Strict rules — violations are not acceptable:
- Do NOT change grammar
- Do NOT change sentence structure
- Do NOT change word choice (except correcting misspellings)
- Do NOT add content that was not spoken
- Do NOT remove any content
- Do NOT improve or rephrase anything
- Preserve the exact order the physician spoke within each section

Output format — plain text only, nothing else:

## HPI

[physician's words here]

## Assessment & Plan

[physician's words here]

Output only the formatted note. No explanation, no commentary, no preamble.`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  let messages: TranscriptMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.text.trim())
    .join("\n\n");

  if (!userText) {
    return Response.json({ error: "No physician speech found in transcript" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: FORMAT_PROMPT,
      messages: [{ role: "user", content: userText }],
      maxOutputTokens: 2000,
    });

    return Response.json({ formatted: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Formatting failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
