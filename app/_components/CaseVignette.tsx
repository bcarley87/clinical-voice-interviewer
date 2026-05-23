import { VIGNETTE } from "@/data/vignette";

export function CaseVignette() {
  const V = VIGNETTE;

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-soft)",
        borderRadius: 14,
        padding: "22px 24px 18px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: "1px solid var(--border-soft)",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--dim-foreground)", marginBottom: 8 }}>
            {V.caseId}
          </div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--foreground)", lineHeight: 1.2 }}>
            {V.patient}
          </h2>
          <p style={{ margin: "4px 0 0", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13.5, lineHeight: 1.45, color: "var(--muted-foreground)", maxWidth: "42ch" }}>
            &ldquo;{V.chief}&rdquo;
          </p>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--primary)", textAlign: "right", flexShrink: 0, lineHeight: 1.3 }}>
          {V.stampTop}
          <div style={{ color: "var(--dim-foreground)", marginTop: 4 }}>{V.stampBottom}</div>
        </div>
      </div>

      {/* Source blocks */}
      <div
        style={{
          paddingTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {V.sources.map((s, i) =>
          s.highlight ? (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                background: "var(--accent-soft)",
                border: "1px solid var(--primary)",
                borderRadius: 8,
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--primary)", marginBottom: 3 }}>
                {s.label}
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 13, lineHeight: 1.5, color: "var(--foreground)", letterSpacing: "-0.003em" }}>
                {s.body}
              </p>
            </div>
          ) : (
            <div
              key={i}
              style={{
                paddingTop: i === 0 ? 2 : 8,
                borderTop: i === 0 ? "none" : "1px solid var(--border-soft)",
                display: "grid",
                gap: 3,
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--dim-foreground)" }}>
                {s.label}
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 13, lineHeight: 1.5, color: "var(--foreground)", letterSpacing: "-0.003em" }}>
                {s.body}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
