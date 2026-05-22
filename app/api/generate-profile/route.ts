import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { TranscriptMessage } from "@/hooks/useRealtimeSession";

export const maxDuration = 120;

const PROFILE_SYSTEM_PROMPT = `You are a voice profile compiler. You have just received the complete transcript of a clinical voice interview with a radiation oncologist. The interview consisted of the physician dictating a consult note from a patient vignette, followed by targeted follow-up questions about their documentation choices.

Compile the following document from the transcript. Preserve the physician's exact words wherever possible — this is a reference document, not a summary.

# CLINICAL VOICE PROFILE: [Physician Name], [Credentials]
# Radiation Oncology

## Core Clinical Voice
[3 sentences capturing the essence of how this physician writes — their default structure, their relationship with detail, and their instinct for what belongs in a note vs. what doesn't.]

---

## DICTATED NOTE (Verbatim)

### HPI:
[Their complete dictated HPI, preserved exactly as spoken]

### Assessment & Plan:
[Their complete dictated A&P, preserved exactly as spoken]

---

## CONSTRUCTION ANALYSIS

[For each follow-up question the interviewer asked, include:]

### [The question]
[The physician's full answer, preserved verbatim]

---

## VOICE PROFILE

### Note Structure:
[How they organize the HPI — what comes first, how they sequence information, how they transition to the assessment]
[How they format the A&P — combined vs. separated, paragraph vs. structured, length tendencies]

### Signature Phrases & Patterns:
[Exact phrases and sentence structures observed in the dictated note — quote directly]
[Repeated constructions, preferred verbs, characteristic transitions]

### Formatting Choices:
[Abbreviation practices — what they abbreviate, what they spell out]
[Use of headers, bullets, numbering, or lack thereof]
[Paragraph structure — short declarative sentences vs. longer compound constructions]

### Information Hierarchy:
[What they put first in the HPI and why]
[Where clinical reasoning lives — explicit in the note vs. implicit]
[Where patient concerns, goals-of-care, and consent documentation live]
[How much treatment rationale appears in the note vs. in separate orders]

### Ordering Language:
[How their recommendation language in the A&P differs from their prescription/directive language]
[Simulation and planning communication patterns]
[Coordination documentation with other services]

### Always:
[Specific patterns to replicate — extracted from the note and confirmed in follow-ups]

### Never:
[Specific patterns to avoid — things they called out as lazy, unacceptable, or not their style]

### Red Flag:
[Their answer about the worst documentation they've seen — what defines unacceptable to them]

### Voice Calibration:
[Key quotes from their follow-up answers that capture tone and instinct]

If the physician stated their name and credentials during the interview, use them in the header. If not, use "[Physician Name]" and "[Credentials]" as placeholders.`;

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

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: PROFILE_SYSTEM_PROMPT,
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
