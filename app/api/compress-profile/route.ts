import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { readFile } from "fs/promises";
import { join } from "path";

export const maxDuration = 120;

const FALLBACK_COMPRESS_PROMPT = "Compress this profile into a brief AI-ready summary.";

async function loadCompressPrompt(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "compress-profile-prompt.md"), "utf-8");
  } catch {
    return FALLBACK_COMPRESS_PROMPT;
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let profile: string;
  try {
    ({ profile } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!profile?.trim()) {
    return Response.json({ error: "No profile content provided" }, { status: 400 });
  }

  const systemPrompt = await loadCompressPrompt();

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [{ role: "user", content: profile }],
      maxOutputTokens: 4000,
    });

    return Response.json({ compressed: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Compression failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
