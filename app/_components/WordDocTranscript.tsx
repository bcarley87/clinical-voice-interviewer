"use client";

import { useEffect, useRef } from "react";
import type { TranscriptMessage } from "@/hooks/useRealtimeSession";

type Section = {
  ai: TranscriptMessage | null;
  userParagraph: string;
};

function groupSections(messages: TranscriptMessage[]): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const m of messages) {
    if (m.role === "assistant") {
      if (current !== null) sections.push(current);
      current = { ai: m, userParagraph: "" };
    } else {
      if (current === null) current = { ai: null, userParagraph: "" };
      const t = m.text.trim();
      const sentence = /[.?!]$/.test(t) ? t : t + ".";
      current.userParagraph = current.userParagraph
        ? current.userParagraph + " " + sentence
        : sentence;
    }
  }

  if (current !== null) sections.push(current);
  return sections;
}

interface WordDocTranscriptProps {
  isActive: boolean;
  isEditing?: boolean;
  messages: TranscriptMessage[];
  aiPartial?: string;
  onEdit?: (id: string, text: string) => void;
}

export function WordDocTranscript({
  isActive,
  isEditing = false,
  messages,
  aiPartial = "",
  onEdit,
}: WordDocTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visible = isActive || isEditing;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, aiPartial]);

  const userWordCount = messages
    .filter((m) => m.role === "user")
    .reduce((acc, m) => acc + m.text.trim().split(/\s+/).filter(Boolean).length, 0);

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--muted)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.4s ease 0.35s, transform 0.45s ease 0.35s",
        zIndex: 1,
      }}
    >
      {/* Toolbar */}
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
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          {isEditing ? "Review · edit your responses" : "HPI · Live transcript"}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "var(--dim-foreground)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {userWordCount > 0 ? `${userWordCount} words` : ""}
        </span>
      </div>

      {/* Body */}
      {isEditing ? (
        /* ── Review mode: interleaved Q&A on white page ── */
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "20px 16px 24px",
            background: "#e8e8e4",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
              borderRadius: 2,
              padding: "44px 52px 52px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {messages.length === 0 && (
              <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 15, color: "#999" }}>
                No transcript recorded.
              </p>
            )}
            {messages.map((m) =>
              m.role === "assistant" ? (
                <p
                  key={m.id}
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: "#888888",
                    fontStyle: "italic",
                    letterSpacing: "0em",
                  }}
                >
                  {m.text}
                </p>
              ) : (
                <textarea
                  key={m.id}
                  value={m.text}
                  onChange={(e) => onEdit?.(m.id, e.target.value)}
                  rows={Math.max(2, Math.ceil(m.text.length / 72))}
                  style={{
                    display: "block",
                    width: "100%",
                    fontFamily: "var(--font-serif)",
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "#111111",
                    letterSpacing: "-0.003em",
                    background: "#f7f7f5",
                    border: "1px solid #e0e0dc",
                    borderRadius: 4,
                    padding: "10px 14px",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              )
            )}
          </div>
        </div>
      ) : (
        /* ── Live transcript mode ──────────────────────── */
        <div
          ref={scrollRef}
          style={{
            padding: "24px 28px 28px",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.length === 0 && !aiPartial ? (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-serif)",
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--muted-foreground)",
                letterSpacing: "-0.003em",
              }}
            >
              Speak when ready<span className="as-caret" />
            </p>
          ) : (
            <>
              {groupSections(messages).map((section, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {section.ai && (
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-sans)",
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: "var(--muted-foreground)",
                        letterSpacing: "0em",
                      }}
                    >
                      {section.ai.text}
                    </p>
                  )}
                  {section.userParagraph && (
                    <p
                      style={
                        {
                          margin: 0,
                          fontFamily: "var(--font-serif)",
                          fontSize: 15,
                          lineHeight: 1.65,
                          color: "var(--foreground)",
                          letterSpacing: "-0.003em",
                          textWrap: "pretty",
                        } as React.CSSProperties
                      }
                    >
                      {section.userParagraph}
                    </p>
                  )}
                </div>
              ))}
              {/* In-progress AI text */}
              {aiPartial && (
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: "var(--muted-foreground)",
                    letterSpacing: "0em",
                    opacity: 0.7,
                  }}
                >
                  {aiPartial}
                  <span className="as-caret" />
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
