"use client";

import type { TranscriptMessage } from "@/hooks/useRealtimeSession";

interface WordDocTranscriptProps {
  isActive: boolean;
  messages: TranscriptMessage[];
}

export function WordDocTranscript({ isActive, messages }: WordDocTranscriptProps) {
  const wordCount = messages.reduce(
    (acc, m) => acc + m.text.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  return (
    <div
      aria-hidden={!isActive}
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--muted)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateY(0)" : "translateY(8px)",
        pointerEvents: isActive ? "auto" : "none",
        transition: "opacity 0.4s ease 0.35s, transform 0.45s ease 0.35s",
        zIndex: 1,
      }}
    >
      {/* Doc toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
          HPI · Live transcript
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.08em", color: "var(--dim-foreground)", fontVariantNumeric: "tabular-nums" }}>
          {wordCount > 0 ? `${wordCount} words` : ""}
        </span>
      </div>

      {/* Doc body */}
      <div
        style={{
          padding: "24px 28px 28px",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 ? (
          <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 15, lineHeight: 1.65, color: "var(--muted-foreground)", letterSpacing: "-0.003em" }}>
            Speak when ready<span className="as-caret" />
          </p>
        ) : (
          messages.map((m, i) => (
            <p key={m.id} style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 15, lineHeight: 1.65, color: "var(--foreground)", letterSpacing: "-0.003em", textWrap: "pretty" } as React.CSSProperties}>
              {m.text}
              {i === messages.length - 1 && <span className="as-caret" />}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
