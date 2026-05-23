"use client";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TopbarProps {
  isActive: boolean;
  elapsedSeconds: number;
  onStop: () => void;
}

export function Topbar({ isActive, elapsedSeconds, onStop }: TopbarProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        padding: "0 28px",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--card)",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
          </svg>
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, letterSpacing: "-0.005em", lineHeight: 1.2, color: "var(--foreground)" }}>
          Clinical Voice Interviewer
          <div style={{ fontSize: 10, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--dim-foreground)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>
            St. Mercy · Radiation Oncology
          </div>
        </div>
      </div>

      {/* Stepper */}
      <nav style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dim-foreground)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: "var(--muted)", color: "var(--foreground)" }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, background: "var(--primary)", color: "var(--primary-foreground)", display: "grid", placeItems: "center", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500 }}>1</span>
          Dictation
        </div>
        <div style={{ width: 22, height: 1, background: "var(--border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999 }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, background: "var(--muted)", color: "var(--muted-foreground)", display: "grid", placeItems: "center", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500 }}>2</span>
          Follow-ups
        </div>
        <div style={{ width: 22, height: 1, background: "var(--border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999 }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, background: "var(--muted)", color: "var(--muted-foreground)", display: "grid", placeItems: "center", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500 }}>3</span>
          Profile
        </div>
      </nav>

      {/* Right slot */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isActive ? (
          <>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--foreground)", letterSpacing: "0.06em" }}>
              {formatTime(elapsedSeconds)}
            </span>
            <button
              onClick={onStop}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 30,
                padding: "0 12px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--foreground)",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                letterSpacing: "-0.005em",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="1.5" />
              </svg>
              End
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "right", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, lineHeight: 1.2, color: "var(--foreground)" }}>
              Dr. Amara Okafor
              <div style={{ fontSize: 10, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--dim-foreground)", letterSpacing: "0.10em", textTransform: "uppercase", marginTop: 3 }}>
                Attending · MRN-issued
              </div>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--muted)", border: "1px solid var(--border)", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500, color: "var(--foreground)", flexShrink: 0 }}>
              AO
            </div>
          </>
        )}
      </div>
    </header>
  );
}
