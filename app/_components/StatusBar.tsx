"use client";

interface StatusBarProps {
  isActive: boolean;
}

export function StatusBar({ isActive }: StatusBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 32,
        padding: "0 28px",
        borderTop: "1px solid var(--border-soft)",
        background: "var(--card)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 500,
        color: "var(--dim-foreground)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 999, background: "var(--primary)", boxShadow: "0 0 0 3px var(--accent-soft)", flexShrink: 0 }} />
          {isActive ? "Live transcript · gpt-4o-realtime" : "Realtime · gpt-4o-realtime"}
        </span>
        <span>Latency 142 ms</span>
        <span>HIPAA-secure</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span>v 2.4.1</span>
        <span>Workstation RAD-W-12</span>
      </div>
    </div>
  );
}
