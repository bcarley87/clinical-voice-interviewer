import { readFile } from "fs/promises";
import { join } from "path";

const FALLBACK_INSTRUCTIONS = `You are a Clinical Voice Interviewer AI. Begin the session by briefly introducing yourself and presenting a patient vignette. Ask the physician to dictate a clinical note (HPI + Assessment & Plan) as they normally would. After receiving the note, ask targeted follow-up questions one at a time about their documentation choices to capture their clinical voice and style.`;

async function loadInstructions(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "system-prompt.md"), "utf-8");
  } catch {
    return FALLBACK_INSTRUCTIONS;
  }
}

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const instructions = await loadInstructions();

  let response: globalThis.Response;
  try {
    response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expires_after: { anchor: "created_at", seconds: 600 },
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions,
          audio: {
            output: { voice: "coral" },
            input: { transcription: { model: "whisper-1" } },
          },
        },
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return Response.json({ error: message }, { status: 502 });
  }

  if (!response.ok) {
    const body = await response.text();
    return Response.json(
      { error: `OpenAI error (${response.status}): ${body}` },
      { status: response.status }
    );
  }

  const data = (await response.json()) as { value?: string };

  const clientSecret = data.value;
  if (!clientSecret) {
    return Response.json(
      { error: "OpenAI did not return a client secret" },
      { status: 502 }
    );
  }

  return Response.json({ clientSecret });
}
