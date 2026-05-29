import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { readFile } from "fs/promises";
import { join } from "path";
import type { TranscriptMessage } from "@/hooks/useRealtimeSession";

export const maxDuration = 120;

const FALLBACK_PROFILE_PROMPT = "Summarize this transcript into a brief voice profile.";

async function loadProfilePrompt(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "generate-profile-prompt.md"), "utf-8");
  } catch {
    return FALLBACK_PROFILE_PROMPT;
  }
}

function formatTranscript(messages: TranscriptMessage[]): string {
  return messages
    .map((m) => {
      const speaker = m.role === "assistant" ? "INTERVIEWER" : "PHYSICIAN";
      return `${speaker}: ${m.text}`;
    })
    .join("\n\n");
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let messages: TranscriptMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "No transcript messages provided" },
      { status: 400 }
    );
  }

  const transcript = formatTranscript(messages);
  const systemPrompt = await loadProfilePrompt();

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is the complete interview transcript:\n\n${transcript}`,
        },
      ],
      maxOutputTokens: 4000,
    });

    return Response.json({ profile: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
