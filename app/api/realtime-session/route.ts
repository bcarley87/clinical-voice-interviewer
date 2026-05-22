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
    response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        modalities: ["text", "audio"],
        instructions,
        voice: "coral",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
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

  const data = (await response.json()) as {
    client_secret: { value: string };
  };

  return Response.json({ clientSecret: data.client_secret.value });
}
