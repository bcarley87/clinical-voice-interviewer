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

function buildTranscript(formattedNote: string, messages: TranscriptMessage[]): string {
  const parts: string[] = [];

  if (formattedNote.trim()) {
    parts.push("DICTATED NOTE (physician-edited):\n\n" + formattedNote.trim());
  }

  const qaMessages = messages.filter((m) => m.role === "assistant" || m.role === "user");
  if (qaMessages.length > 0) {
    const qa = qaMessages
      .map((m) => {
        const speaker = m.role === "assistant" ? "INTERVIEWER" : "PHYSICIAN";
        return `${speaker}: ${m.text}`;
      })
      .join("\n\n");
    parts.push("FOLLOW-UP INTERVIEW:\n\n" + qa);
  }

  return parts.join("\n\n---\n\n");
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  let formattedNote: string;
  let messages: TranscriptMessage[];
  try {
    ({ formattedNote, messages } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!formattedNote?.trim() && (!Array.isArray(messages) || messages.length === 0)) {
    return Response.json({ error: "No transcript content provided" }, { status: 400 });
  }

  const transcript = buildTranscript(formattedNote ?? "", messages ?? []);
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
      maxOutputTokens: 6000,
    });

    return Response.json({ profile: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
