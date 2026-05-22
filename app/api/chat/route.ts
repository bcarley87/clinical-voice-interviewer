import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { readFile } from "fs/promises";
import { join } from "path";

export const maxDuration = 60;

const FALLBACK_SYSTEM_PROMPT = `You are a clinical voice interviewer AI. Your role is to help capture a physician's documentation voice and style.

When you receive the message "##INIT##", begin the session by:
1. Presenting a brief patient vignette
2. Asking the physician to dictate a clinical note (HPI + Assessment & Plan) for that patient

After the physician provides their note, ask targeted follow-up questions ONE AT A TIME about their writing choices to better understand their documentation style and voice.

Keep your questions focused, professional, and clinically grounded.`;

async function loadSystemPrompt(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "system-prompt.md"), "utf-8");
  } catch {
    return FALLBACK_SYSTEM_PROMPT;
  }
}

export async function POST(req: Request) {
  let messages: UIMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!Array.isArray(messages)) {
    return Response.json({ error: "messages must be an array" }, { status: 400 });
  }
  const systemPrompt = await loadSystemPrompt();

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
