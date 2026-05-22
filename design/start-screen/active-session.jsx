/* ───────────────────────────────────────────────────────────────
   Active session — four live-transcript treatments.
   Each artboard reuses the Console shell (topbar, statusbar)
   and depicts the same moment in time: the physician is
   dictating an HPI for the tonsillar SCC case. The orb sits in
   listening state; an End button replaces the Begin CTA.
   The four directions differ in WHERE and HOW the live
   transcript appears.
   ─────────────────────────────────────────────────────────────── */

// Hand-picked HPI transcript — written as a real rad-onc dictation
// would be spoken. Marked words are split so the last fragment can
// render as "still speaking".
const TRANSCRIPT = [
  "Mr. Garcia is a 58-year-old gentleman referred for radiation oncology consultation.",
  "He carries a diagnosis of biopsy-proven p16-positive squamous cell carcinoma of the left tonsil, clinical stage T2 N2a M0.",
  "He first noted a left neck mass approximately six weeks ago, prompting evaluation by ENT.",
  "Imaging workup including PET CT and MRI of the neck confirms locally advanced disease without distant metastasis.",
];
const TRANSCRIPT_PARTIAL = "He underwent dental clearance prior to today's visit and was seen by";

// Shared header bar — active session uses a compact telemetry strip
// instead of the start-screen brand block.
function ActiveHeader({ session = "014" }) {
  return (
    <div className="as-topbar">
      <div className="as-brand">
        <div className="as-brand-dot">
          <span className="as-pulse" />
        </div>
        <div className="as-brand-text">
          Recording
          <small>Session {session} · St. Mercy Rad-Onc</small>
        </div>
      </div>

      <div className="as-stepper">
        <div className="as-step done"><span className="num">✓</span> Setup</div>
        <div className="line"></div>
        <div className="as-step active"><span className="num">1</span> Dictation</div>
        <div className="line"></div>
        <div className="as-step"><span className="num">2</span> Follow-ups</div>
        <div className="line"></div>
        <div className="as-step"><span className="num">3</span> Profile</div>
      </div>

      <div className="as-timer-wrap">
        <span className="as-timer">02:47</span>
        <button className="as-end">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>
          End
        </button>
      </div>
    </div>
  );
}

function ActiveStatusbar() {
  return (
    <div className="cv-b-statusbar">
      <div>
        <span><span className="dot"></span>Live transcript · gpt-4o-realtime</span>
        <span>Latency 142 ms</span>
        <span>HIPAA-secure</span>
      </div>
      <div>
        <span>237 words · ~4 min spoken</span>
      </div>
    </div>
  );
}

// Small reusable mini case chip — same data as Console start, but
// reduced to a one-line reference for active mode.
function CaseChip({ inline }) {
  return (
    <div className={`as-case-chip ${inline ? "inline" : ""}`}>
      <div className="as-case-chip-id">Case · CVI-014-A</div>
      <div className="as-case-chip-title">
        58 y.o. male · L tonsillar SCC · <span className="accent">T2 N2a M0</span>
      </div>
      {!inline && (
        <p className="as-case-chip-chief">
          Definitive treatment discussion. p16-positive. Med-onc recommends concurrent cisplatin.
        </p>
      )}
    </div>
  );
}

// Re-usable mini orb (sized down for the transcript layouts).
function MiniOrb({ size = 180, listening = true }) {
  // Lightweight static ring stack — visually consistent with the
  // particles variant but cheap to render in 4 artboards at once.
  return (
    <div className="as-orb" style={{ width: size, height: size }}>
      <div className="as-orb-halo" />
      <div className="as-orb-ring r1" />
      <div className="as-orb-ring r2" />
      <div className="as-orb-ring r3" />
      <div className="as-orb-core" />
      <div className="as-orb-caption">
        <span className="cv-b-orb-dot" />
        {listening ? "Listening" : "AI speaking"}
      </div>
    </div>
  );
}

/* ===============================================================
   Option A · SUBTITLE STRIP
   Live transcript appears as a 3-line subtitle directly under
   the orb. Older lines ghosted, latest line bold, partial
   sentence in accent color w/ caret.
   =============================================================== */
function ActiveSubtitle() {
  return (
    <div className="cv-root as-root as-a" data-screen-label="A · Subtitle strip">
      <ActiveHeader />
      <div className="as-body as-a-body">
        <div className="as-left">
          <MiniOrb size={200} />
          <div className="as-subtitle">
            <p className="as-sub-line older">{TRANSCRIPT[1]}</p>
            <p className="as-sub-line recent">{TRANSCRIPT[3]}</p>
            <p className="as-sub-line active">
              {TRANSCRIPT_PARTIAL}<span className="as-caret" />
            </p>
          </div>
        </div>
        <div className="as-right">
          <CaseChip />
        </div>
      </div>
      <ActiveStatusbar />
    </div>
  );
}

/* ===============================================================
   Option B · DOCUMENT MODE
   Right panel is the growing HPI document; case reduced to a
   compact sticky reference at the top. Serif text, journal feel.
   =============================================================== */
function ActiveDocument() {
  return (
    <div className="cv-root as-root as-b" data-screen-label="B · Document mode">
      <ActiveHeader />
      <div className="as-body as-b-body">
        <div className="as-left as-b-left">
          <MiniOrb size={200} />
          <div className="as-b-helper">
            <div className="as-helper-kicker">Now dictating</div>
            <div className="as-helper-stage">History of Present Illness</div>
            <div className="as-helper-meta">
              <span>4 sentences</span>
              <span>237 words</span>
            </div>
          </div>
        </div>

        <div className="as-right as-b-right">
          <div className="as-b-doc-head">
            <CaseChip inline />
            <div className="as-b-doc-tab">HPI</div>
          </div>
          <div className="as-b-doc-body">
            {TRANSCRIPT.map((s, i) => (
              <p key={i} className="as-b-doc-p">{s}</p>
            ))}
            <p className="as-b-doc-p partial">
              {TRANSCRIPT_PARTIAL}<span className="as-caret" />
            </p>
          </div>
        </div>
      </div>
      <ActiveStatusbar />
    </div>
  );
}

/* ===============================================================
   Option C · TELEPROMPTER BAND
   Full-width bottom band runs the transcript like closed-captions.
   Older lines fade up; active line is large + accent underline.
   =============================================================== */
function ActiveTeleprompter() {
  return (
    <div className="cv-root as-root as-c" data-screen-label="C · Teleprompter band">
      <ActiveHeader />
      <div className="as-body as-c-body">
        <div className="as-c-stage">
          <MiniOrb size={220} />
          <div className="as-c-meta">
            <span>HPI · Sentence 5 of …</span>
          </div>
        </div>
        <div className="as-c-side">
          <CaseChip />
        </div>
      </div>
      <div className="as-c-prompter">
        <div className="as-c-prompter-inner">
          <p className="as-c-line oldest">{TRANSCRIPT[2]}</p>
          <p className="as-c-line older">{TRANSCRIPT[3]}</p>
          <p className="as-c-line active">
            {TRANSCRIPT_PARTIAL}<span className="as-caret" />
          </p>
        </div>
        <div className="as-c-prompter-side">
          <div className="as-c-prompter-kicker">Live transcript</div>
          <div className="as-c-prompter-confidence">
            <span className="conf-dot"></span> 99.2% confident
          </div>
        </div>
      </div>
      <ActiveStatusbar />
    </div>
  );
}

/* ===============================================================
   Option D · FLOATING STACK
   Each sentence pops into a stack underneath the orb. Newest at
   bottom, larger + accent border. Older fade and shrink upward.
   Ephemeral, voice-first feel.
   =============================================================== */
function ActiveFloating() {
  const lines = [
    { text: TRANSCRIPT[0], level: 0 },
    { text: TRANSCRIPT[1], level: 1 },
    { text: TRANSCRIPT[2], level: 2 },
    { text: TRANSCRIPT[3], level: 3 },
    { text: TRANSCRIPT_PARTIAL + " ", level: 4, partial: true },
  ];
  return (
    <div className="cv-root as-root as-d" data-screen-label="D · Floating stack">
      <ActiveHeader />
      <div className="as-body as-d-body">
        <div className="as-left as-d-left">
          <MiniOrb size={180} />
        </div>
        <div className="as-d-center">
          <div className="as-d-stack">
            {lines.map((l, i) => (
              <div key={i} className={`as-d-card level-${l.level} ${l.partial ? "partial" : ""}`}>
                {l.text}
                {l.partial && <span className="as-caret" />}
              </div>
            ))}
          </div>
        </div>
        <div className="as-right as-d-right">
          <CaseChip />
        </div>
      </div>
      <ActiveStatusbar />
    </div>
  );
}

/* ===============================================================
   Option E · ORB STEPS ASIDE
   The orb shrinks and tucks into a corner; the transcript fills
   the center where the orb used to be. Most "documentation-first"
   of the lot — the physician's own words command the stage.
   =============================================================== */
function ActiveOrbAside() {
  return (
    <div className="cv-root as-root as-e" data-screen-label="E · Orb steps aside">
      <ActiveHeader />
      <div className="as-body as-e-body">
        {/* Small orb in the corner, with case chip beside it */}
        <div className="as-e-corner">
          <div className="as-e-mini-orb">
            <div className="as-e-mini-halo" />
            <div className="as-e-mini-ring r1" />
            <div className="as-e-mini-ring r2" />
            <div className="as-e-mini-core" />
          </div>
          <div className="as-e-corner-meta">
            <span className="as-e-corner-status">
              <span className="cv-b-orb-dot" /> Listening
            </span>
            <span className="as-e-corner-case">CVI-014-A · L tonsillar SCC · T2 N2a M0</span>
          </div>
        </div>

        {/* Center stage transcript */}
        <div className="as-e-stage">
          <div className="as-e-stage-kicker">History of Present Illness</div>
          <div className="as-e-transcript">
            <p className="as-e-line ghost">{TRANSCRIPT[0]}</p>
            <p className="as-e-line older">{TRANSCRIPT[1]}</p>
            <p className="as-e-line recent">{TRANSCRIPT[2]}</p>
            <p className="as-e-line newest">{TRANSCRIPT[3]}</p>
            <p className="as-e-line active">
              {TRANSCRIPT_PARTIAL}<span className="as-caret" />
            </p>
          </div>
          <div className="as-e-stage-foot">
            <span>237 words · 02:47 elapsed</span>
            <span className="as-e-pause">Pause ␣</span>
          </div>
        </div>
      </div>
      <ActiveStatusbar />
    </div>
  );
}

window.ActiveSubtitle = ActiveSubtitle;
window.ActiveDocument = ActiveDocument;
window.ActiveTeleprompter = ActiveTeleprompter;
window.ActiveFloating = ActiveFloating;
window.ActiveOrbAside = ActiveOrbAside;

/* ===============================================================
   F · BEGIN → ACTIVE (animated)
   Interactive prototype: click "Begin dictation" and watch the
   orb shrink and slide to the top-right corner; a word-doc style
   transcript box fades into where the orb used to be. The case
   vignette on the right stays put so the physician can reference
   it throughout. No typewriter effects — the transcript appears
   as a plain document, just with a blinking caret at the end.
   =============================================================== */
function BeginToActive({ placement = "corner" } = {}) {
  const [active, setActive] = React.useState(false);
  const V = window.VIGNETTE;

  return (
    <div
      className="cv-root cv-b bta-root"
      data-screen-label={`F · Begin to active (\u00b7 ${placement})`}
    >
      <style>{`
        .cv-b { display: grid; grid-template-rows: auto 1fr auto; }
      `}</style>

      {/* Topbar — Console start-screen chrome (consistent with where user came from) */}
      <div className="cv-b-topbar">
        <div className="cv-b-brand">
          <div className="cv-b-brand-mark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3"/>
              <path d="M5 11a7 7 0 0 0 14 0"/>
            </svg>
          </div>
          <div className="cv-b-brand-text">
            Clinical Voice Interviewer
            <small>St. Mercy · Radiation Oncology</small>
          </div>
        </div>

        <div className="cv-b-stepper">
          <div className="cv-b-step active"><span className="num">1</span> Dictation</div>
          <div className="line"></div>
          <div className="cv-b-step"><span className="num">2</span> Follow-ups</div>
          <div className="line"></div>
          <div className="cv-b-step"><span className="num">3</span> Profile</div>
        </div>

        <div className="bta-topbar-end">
          {!active ? (
            <>
              <div className="cv-b-user" style={{ textAlign: "right" }}>
                Dr. Amara Okafor
                <small>Attending · MRN-issued</small>
              </div>
              <div className="cv-b-avatar">AO</div>
            </>
          ) : (
            <>
              <span className="bta-timer">02:47</span>
              <button className="bta-end" onClick={() => setActive(false)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>
                End
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="cv-b-body bta-body">
        <div className={`bta-left ${active ? "is-active" : ""} placement-${placement}`}>
          {/* Corner pill — visible in active state, mini particle orb + Listening */}
          <div className="bta-corner-pill">
            <div className="bta-corner-orb-wrap">
              <window.OrbParticles speaking={active} waveStyle="gentle" />
            </div>
            <div className="bta-corner-status">
              <span className="cv-b-orb-dot" /> Listening
            </div>
          </div>

          {/* Header copy — fades + collapses out on active */}
          <div className="bta-header">
            <div className="cv-b-kicker">
              Session 014 · {active ? "Recording" : "Ready"}
            </div>
            <h1 className="cv-b-title">
              Capture your <span className="accent">documentation voice</span>.
            </h1>
            <p className="cv-b-lede">
              Dictate your <em>HPI and Assessment &amp; Plan</em> for the case at right as you normally would. I&rsquo;ll then ask a few questions about your construction choices.
            </p>
          </div>

          {/* Stage — holds the orb (fades out) and the transcript (fades in) */}
          <div className="bta-stage">
            <div className="bta-orb-frame">
              <window.OrbParticles speaking={active} waveStyle="gentle" />
            </div>

            {/* Word-doc style transcript */}
            <div className="bta-doc" aria-hidden={!active}>
              <div className="bta-doc-head">
                <span className="bta-doc-kicker">HPI · Live transcript</span>
                <span className="bta-doc-meta">237 words · 02:47</span>
              </div>
              <div className="bta-doc-body">
                {TRANSCRIPT.map((s, i) => (
                  <p key={i}>{s}</p>
                ))}
                <p>
                  {TRANSCRIPT_PARTIAL}
                  <span className="as-caret" />
                </p>
              </div>
            </div>
          </div>

          {/* CTA — Begin in start state, hidden in active (End is in topbar) */}
          <div className="bta-cta">
            {!active ? (
              <button className="cv-btn" onClick={() => setActive(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 4 20 12 6 20 6 4"/>
                </svg>
                Begin dictation
              </button>
            ) : (
              <p className="bta-foot-note">
                Recording · voice profile capture in progress
              </p>
            )}
          </div>
        </div>

        {/* RIGHT — vignette, unchanged across states */}
        <div className="cv-b-right">
          <div className="cv-b-chart">
            <div className="cv-b-chart-head">
              <div style={{ minWidth: 0 }}>
                <div className="cv-b-chart-id">{V.caseId}</div>
                <h2 className="cv-b-chart-title">{V.patient}</h2>
                <p className="cv-b-chart-chief">&ldquo;{V.chief}&rdquo;</p>
              </div>
              <div className="cv-b-chart-stamp">
                {V.stampTop}
                <small>{V.stampBottom}</small>
              </div>
            </div>
            <div className="cv-b-chart-sources">
              {V.sources.map((s, i) => (
                <div key={i} className={`cv-b-src ${s.highlight ? "cv-b-src-hl" : ""}`}>
                  <div className="cv-b-src-label">{s.label}</div>
                  <p className="cv-b-src-body">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statusbar */}
      <div className="cv-b-statusbar">
        <div>
          <span><span className="dot"></span>{active ? "Live transcript · gpt-4o-realtime" : "Realtime · gpt-4o-realtime"}</span>
          <span>Latency 142 ms</span>
          <span>HIPAA-secure</span>
        </div>
        <div>
          <span>v 2.4.1</span>
          <span>Workstation RAD-W-12</span>
        </div>
      </div>
    </div>
  );
}

window.BeginToActive = BeginToActive;