/* ───────────────────────────────────────────────────────────────
   Direction A — "Atrium"
   Editorial, warm, single-column. A breathing concentric ring
   stands in for the dormant voice listener. Serif headline gives
   the clinical tool a human, almost editorial tone. The vignette
   appears inset as a "case at hand" card.
   ─────────────────────────────────────────────────────────────── */

function DirectionA() {
  const V = window.VIGNETTE;
  const padScale = "calc(var(--cv-pad, 1))";

  return (
    <div className="cv-root cv-a" data-screen-label="Direction A — Atrium">
      <style>{`
        .cv-a { display: grid; grid-template-columns: 1fr; place-items: center; }
        .cv-a-stage {
          width: 100%; height: 100%;
          display: grid;
          grid-template-rows: auto 1fr auto;
          padding: calc(28px * var(--cv-pad)) calc(56px * var(--cv-pad));
          gap: calc(24px * var(--cv-pad));
        }
        .cv-a-topbar {
          display: flex; align-items: center; justify-content: space-between;
        }
        .cv-a-brand { display: flex; align-items: center; gap: 12px; }
        .cv-a-brand-mark {
          width: 26px; height: 26px; border-radius: 7px;
          background: var(--cv-bg-3);
          border: 1px solid var(--cv-line);
          display: grid; place-items: center;
          color: var(--cv-accent);
        }
        .cv-a-brand-name {
          font: 500 13px/1 var(--cv-sans);
          letter-spacing: -0.005em;
        }
        .cv-a-brand-sub {
          font: 500 11px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding-left: 12px;
          margin-left: 4px;
          border-left: 1px solid var(--cv-line-soft);
        }

        .cv-a-main {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: calc(72px * var(--cv-pad));
          align-items: center;
        }

        /* LEFT — voice viz + copy */
        .cv-a-left { display: flex; flex-direction: column; gap: calc(28px * var(--cv-pad)); }
        .cv-a-ring-wrap {
          width: 240px; height: 240px;
          position: relative;
          display: grid; place-items: center;
        }
        .cv-a-ring {
          position: absolute; inset: 0;
          border-radius: 999px;
          border: 1px solid var(--cv-line);
        }
        .cv-a-ring.r1 { inset: 22%; background: var(--cv-accent-soft); border-color: transparent; animation: cvBreathe 4.5s ease-in-out infinite; }
        .cv-a-ring.r2 { inset: 10%; animation: cvBreathe2 4.5s ease-in-out infinite; }
        .cv-a-ring.r3 { animation: cvBreathe3 4.5s ease-in-out infinite; }
        .cv-a-mic {
          position: relative; z-index: 2;
          color: var(--cv-fg);
        }
        .cv-a-mic svg { display: block; }

        .cv-a-headline {
          font-family: var(--cv-serif);
          font-size: 52px;
          line-height: 1.04;
          letter-spacing: -0.025em;
          font-weight: 400;
          max-width: 22ch;
        }
        .cv-a-headline em {
          font-style: italic;
          color: var(--cv-accent);
        }
        .cv-a-sub {
          font-size: 15px;
          line-height: 1.55;
          color: var(--cv-fg-mut);
          max-width: 44ch;
        }

        .cv-a-cta-row {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .cv-a-meta {
          display: flex; gap: 14px;
          font: 500 11px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          align-items: center;
        }
        .cv-a-meta span.sep {
          width: 3px; height: 3px; border-radius: 999px;
          background: var(--cv-fg-dim);
        }

        /* RIGHT — vignette */
        .cv-a-card {
          background: var(--cv-bg-2);
          border: 1px solid var(--cv-line-soft);
          border-radius: var(--cv-radius);
          padding: calc(28px * var(--cv-pad)) calc(30px * var(--cv-pad));
          position: relative;
          overflow: hidden;
        }
        .cv-a-card::before {
          content: "";
          position: absolute; left: 0; top: 28px; bottom: 28px;
          width: 2px;
          background: var(--cv-accent);
        }
        .cv-a-card-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .cv-a-card-title {
          font-family: var(--cv-serif);
          font-size: 22px;
          line-height: 1.15;
          letter-spacing: -0.015em;
        }
        .cv-a-card-kicker {
          font: 500 10px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .cv-a-card-chief {
          margin: 8px 0 0;
          font-family: var(--cv-serif);
          font-style: italic;
          font-size: 15px;
          line-height: 1.5;
          color: var(--cv-fg-mut);
          max-width: 38ch;
        }

        .cv-a-sources {
          margin-top: 18px;
          display: flex; flex-direction: column;
          gap: 14px;
        }
        .cv-a-src {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
          padding-top: 12px;
          border-top: 1px solid var(--cv-line-soft);
        }
        .cv-a-src:first-child { border-top: 0; padding-top: 0; }
        .cv-a-src-label {
          font: 500 10px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .cv-a-src-body {
          margin: 0;
          font-family: var(--cv-serif);
          font-size: 14.5px;
          line-height: 1.55;
          color: var(--cv-fg);
          letter-spacing: -0.003em;
          text-wrap: pretty;
        }
        .cv-a-src-hl {
          border-top-color: var(--cv-accent);
          padding: 14px 14px 12px;
          background: var(--cv-accent-soft);
          border: 1px solid var(--cv-accent);
          border-radius: var(--cv-radius-sm);
        }
        .cv-a-src-hl .cv-a-src-label {
          color: var(--cv-accent);
        }

        .cv-a-vitals {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1px;
          background: var(--cv-line-soft);
          border: 1px solid var(--cv-line-soft);
          border-radius: 10px;
          overflow: hidden;
          margin: 14px 0 18px;
        }
        .cv-a-vitals > div {
          background: var(--cv-bg-2);
          padding: 10px 12px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .cv-a-vitals-k {
          font: 500 9.5px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .cv-a-vitals-v {
          font: 500 14px/1 var(--cv-sans);
          color: var(--cv-fg);
          letter-spacing: -0.005em;
          font-variant-numeric: tabular-nums;
        }

        .cv-a-row {
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 14px;
          padding: 10px 0;
          border-top: 1px solid var(--cv-line-soft);
          align-items: baseline;
        }
        .cv-a-row:first-of-type { border-top: 0; padding-top: 0; }
        .cv-a-row-k {
          font: 500 10px/1.4 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .cv-a-row-v {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--cv-fg);
        }

        /* footer */
        .cv-a-foot {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: calc(20px * var(--cv-pad));
          border-top: 1px solid var(--cv-line-soft);
        }
        .cv-a-foot-meta {
          display: flex; gap: 18px;
          font: 500 11px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          align-items: center;
        }
        .cv-a-link { color: var(--cv-fg-mut); cursor: pointer; }
        .cv-a-link:hover { color: var(--cv-fg); }
      `}</style>

      <div className="cv-a-stage">
        {/* TOP */}
        <div className="cv-a-topbar">
          <div className="cv-a-brand">
            <div className="cv-a-brand-mark">
              {/* simple mark — a quarter ring suggests waveform */}
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 11 A 9 9 0 0 1 11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="2" cy="11" r="1.3" fill="currentColor"/>
                <circle cx="11" cy="2" r="1.3" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <div className="cv-a-brand-name">Clinical Voice Interviewer</div>
            </div>
            <div className="cv-a-brand-sub">St. Mercy Health · Rad-Onc</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="cv-chip"><span className="dot"></span> Mic ready</span>
            <span className="cv-chip" style={{ background: "transparent" }}>Dr. A. Okafor</span>
          </div>
        </div>

        {/* MAIN */}
        <div className="cv-a-main">
          <div className="cv-a-left">
            <div className="cv-a-ring-wrap" aria-hidden>
              <div className="cv-a-ring r3"></div>
              <div className="cv-a-ring r2"></div>
              <div className="cv-a-ring r1"></div>
              <div className="cv-a-mic">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="3" width="6" height="11" rx="3"/>
                  <path d="M5 11a7 7 0 0 0 14 0"/>
                  <path d="M12 18v3"/>
                </svg>
              </div>
            </div>

            <div>
              <div className="cv-kicker" style={{ marginBottom: 16 }}>Session 014 · Ready to begin</div>
              <h1 className="cv-a-headline">
                Dictate this note <em>in your own voice.</em>
              </h1>
              <p className="cv-a-sub" style={{ marginTop: 18 }}>
                When you start, I&rsquo;ll read the case aloud, then listen as you record your HPI and Assessment &amp; Plan. I&rsquo;ll ask a few follow-ups about your choices &mdash; conversational, not clinical.
              </p>
            </div>

            <div className="cv-a-cta-row">
              <button className="cv-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="3" width="6" height="11" rx="3"/>
                  <path d="M5 11a7 7 0 0 0 14 0"/>
                  <path d="M12 18v3"/>
                </svg>
                Start interview
              </button>
              <button className="cv-btn-ghost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Type instead
              </button>
              <div className="cv-a-meta" style={{ marginLeft: 6 }}>
                <span>~ 6 min</span>
                <span className="sep"></span>
                <span>5 – 7 questions</span>
              </div>
            </div>
          </div>

          {/* VIGNETTE CARD */}
          <div className="cv-a-card">
            <div className="cv-a-card-head">
              <div>
                <div className="cv-a-card-kicker">Case at hand</div>
                <h2 className="cv-a-card-title">{V.patient}</h2>
                <p className="cv-a-card-chief">&ldquo;{V.chief}&rdquo;</p>
              </div>
              <span className="cv-chip">{V.stampTop}</span>
            </div>

            <div className="cv-a-sources">
              {V.sources.map((s, i) => (
                <div
                  key={i}
                  className={`cv-a-src ${s.highlight ? "cv-a-src-hl" : ""}`}
                >
                  <div className="cv-a-src-label">{s.label}</div>
                  <p className="cv-a-src-body">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOT */}
        <div className="cv-a-foot">
          <div className="cv-a-foot-meta">
            <span>v 2.4 · Voice profile capture</span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--cv-fg-dim)" }}></span>
            <span>HIPAA-secure · Recordings discarded after session</span>
          </div>
          <div className="cv-a-foot-meta">
            <span className="cv-a-link">Settings</span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--cv-fg-dim)" }}></span>
            <span className="cv-a-link">Help</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DirectionA = DirectionA;
