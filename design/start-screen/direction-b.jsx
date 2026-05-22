/* ───────────────────────────────────────────────────────────────
   Direction B — "Console"
   Workspace/cockpit feel. Two-column structured layout with a
   live mic-level meter (instead of breathing rings) and a more
   chart-like vignette. Still warm — accent ink + paper-warm card
   surfaces against the deep base.
   ─────────────────────────────────────────────────────────────── */

/* ── Jarvis-style orb ─────────────────────────────────────────
   Four variants chosen by tweak: plasma (soft Siri-ish drift),
   wireframe (Jarvis globe with rotating meridians), iris (flat
   sensor aperture), sphere (photoreal — kept for completeness).
   All share the same caption + halo so the orb area feels
   consistent when swapping.
   ──────────────────────────────────────────────────────────── */

function OrbCaption({ speaking }) {
  return (
    <div className="cv-b-orb-caption">
      <span className="cv-b-orb-dot" />
      {speaking ? "AI speaking" : "Awaiting your voice"}
    </div>
  );
}

function OrbPlasma() {
  return (
    <div className="cv-b-orb-wrap orb-plasma" aria-hidden>
      <div className="cv-b-orb-halo" />
      <div className="orb-plasma-mask">
        <div className="orb-plasma-blob b1" />
        <div className="orb-plasma-blob b2" />
        <div className="orb-plasma-blob b3" />
        <div className="orb-plasma-blob b4" />
        <div className="orb-plasma-grain" />
      </div>
      <div className="orb-plasma-core" />
    </div>
  );
}

function OrbWireframe() {
  // Single SVG of geometric primitives — circle (equator) + a few
  // ellipses (meridians) rotated about Y. Container rotates slowly.
  return (
    <div className="cv-b-orb-wrap orb-wire" aria-hidden>
      <div className="cv-b-orb-halo" />
      <div className="orb-wire-tilt">
        <svg className="orb-wire-svg" viewBox="0 0 200 200">
          <g fill="none" stroke="currentColor" strokeWidth="0.8">
            <circle cx="100" cy="100" r="78" opacity="0.9" />
            {/* meridians — ellipses with varying x-radius */}
            <ellipse cx="100" cy="100" rx="78" ry="78" opacity="0.5" />
            <ellipse cx="100" cy="100" rx="62" ry="78" opacity="0.45" />
            <ellipse cx="100" cy="100" rx="42" ry="78" opacity="0.4" />
            <ellipse cx="100" cy="100" rx="18" ry="78" opacity="0.35" />
            {/* equator + latitudes */}
            <ellipse cx="100" cy="100" rx="78" ry="18" opacity="0.55" />
            <ellipse cx="100" cy="100" rx="74" ry="38" opacity="0.35" />
            <ellipse cx="100" cy="100" rx="74" ry="58" opacity="0.25" />
          </g>
        </svg>
        {/* Rotating outer arc — ticks/notches */}
        <svg className="orb-wire-ticks" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="92"
            fill="none" stroke="currentColor" strokeWidth="1"
            strokeDasharray="2 8" opacity="0.6" />
        </svg>
      </div>
      <div className="orb-wire-core" />
    </div>
  );
}

function OrbIris() {
  // Concentric rings + a small soft center anchor. No rotating
  // dashed arc — that was creating an off-center heavy spot.
  return (
    <div className="cv-b-orb-wrap orb-iris" aria-hidden>
      <div className="cv-b-orb-halo" />
      <div className="orb-iris-ring r1" />
      <div className="orb-iris-ring r2" />
      <div className="orb-iris-ring r3" />
      <div className="orb-iris-ring r4" />
      <div className="orb-iris-center" />
      <div className="orb-iris-core" />
    </div>
  );
}

function OrbSphere() {
  return (
    <div className="cv-b-orb-wrap orb-sphere-v" aria-hidden>
      <div className="cv-b-orb-halo" />
      <div className="cv-b-orb-halo2" />

      <svg className="cv-b-orb-arc cv-b-orb-arc-out" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92"
          fill="none" stroke="currentColor" strokeWidth="1"
          strokeDasharray="40 8 18 6 70 8 26 4"
          strokeLinecap="round" opacity="0.55" />
      </svg>
      <svg className="cv-b-orb-arc cv-b-orb-arc-in" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="78"
          fill="none" stroke="currentColor" strokeWidth="0.8"
          strokeDasharray="6 4 50 6 12 4 28 6"
          strokeLinecap="round" opacity="0.9" />
      </svg>

      <div className="cv-b-orb-lat" />
      <div className="cv-b-orb-sphere">
        <div className="cv-b-orb-sphere-shine" />
        <div className="cv-b-orb-sphere-core" />
      </div>
    </div>
  );
}

function OrbParticles({ speaking = false, waveStyle = "ripple" }) {
  // Bright accent particles forming concentric rings. At rest the
  // rings are nearly perfect circles; when `speaking` flips on,
  // the radius modulates by a sin-wave whose character depends on
  // waveStyle ("gentle" / "ripple" / "pulse"). Amplitude eases
  // toward its target each frame so transitions feel organic.
  const ringRefs = React.useRef([]);
  const stateRef = React.useRef({ speaking, waveStyle, amp: 0 });

  React.useEffect(() => {
    stateRef.current.speaking = speaking;
    stateRef.current.waveStyle = waveStyle;
  }, [speaking, waveStyle]);

  const rings = React.useMemo(() => {
    const cfg = [
      { n: 220, base: 90, freq: 7, phase: 0.0 },
      { n: 180, base: 78, freq: 5, phase: 1.7 },
      { n: 130, base: 64, freq: 9, phase: 0.8 },
    ];
    return cfg.map((c) => {
      const angles = [];
      const props = [];
      for (let i = 0; i < c.n; i++) {
        const t = (i / c.n) * Math.PI * 2;
        angles.push(t);
        props.push({
          op: 0.45 + ((i * 37) % 100) / 220,
          sz: 0.6 + ((i * 19) % 10) / 14,
        });
      }
      return { ...c, angles, props };
    });
  }, []);

  React.useEffect(() => {
    let raf;
    const t0 = performance.now();

    const tick = (now) => {
      const elapsed = (now - t0) / 1000;
      const s = stateRef.current;

      // target amplitude by wave style
      const targetAmp = s.speaking
        ? (s.waveStyle === "gentle" ? 4
          : s.waveStyle === "pulse" ? 13
          : 8)
        : 0.0;
      s.amp += (targetAmp - s.amp) * 0.05;

      // skip computation when amplitude has settled to zero
      if (!s.speaking && s.amp < 0.05 && s.lastSettled) {
        raf = requestAnimationFrame(tick);
        return;
      }
      s.lastSettled = !s.speaking && s.amp < 0.05;

      rings.forEach((ring, idx) => {
        const svg = ringRefs.current[idx];
        if (!svg) return;
        const circles = svg.children;
        for (let i = 0; i < ring.angles.length; i++) {
          const t = ring.angles[i];
          let waveMod;
          if (s.waveStyle === "gentle") {
            waveMod = Math.sin(t * ring.freq + ring.phase + elapsed * 0.6);
          } else if (s.waveStyle === "pulse") {
            waveMod =
              Math.sin(t * ring.freq + ring.phase + elapsed * 2.2) +
              Math.sin(t * 13 + elapsed * 3.4) * 0.5;
          } else {
            // ripple
            waveMod =
              Math.sin(t * ring.freq + ring.phase + elapsed * 1.1) +
              Math.sin(t * ring.freq * 2.3 + ring.phase * 1.7 + elapsed * 0.7) * 0.4;
          }
          const r = ring.base + waveMod * s.amp;
          const x = 100 + Math.cos(t) * r;
          const y = 100 + Math.sin(t) * r;
          const c = circles[i];
          if (c) {
            c.setAttribute("cx", x.toFixed(2));
            c.setAttribute("cy", y.toFixed(2));
          }
        }
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rings]);

  return (
    <div className="cv-b-orb-wrap orb-particles" data-speaking={speaking ? "yes" : "no"} aria-hidden>
      <div className="cv-b-orb-halo" />
      {rings.map((ring, i) => (
        <svg
          key={i}
          ref={(el) => (ringRefs.current[i] = el)}
          className={`orb-p-ring orb-p-ring-${i}`}
          viewBox="0 0 200 200"
        >
          {ring.angles.map((t, j) => {
            const r = ring.base;
            return (
              <circle
                key={j}
                cx={100 + Math.cos(t) * r}
                cy={100 + Math.sin(t) * r}
                r={ring.props[j].sz}
                fill="currentColor"
                opacity={ring.props[j].op}
              />
            );
          })}
        </svg>
      ))}
      <div className="orb-p-core" />
    </div>
  );
}

function JarvisOrb({ variant = "particles", speaking = false, waveStyle = "ripple" }) {
  let orb;
  if (variant === "wireframe")      orb = <OrbWireframe />;
  else if (variant === "iris")      orb = <OrbIris />;
  else if (variant === "plasma")    orb = <OrbPlasma />;
  else if (variant === "sphere")    orb = <OrbSphere />;
  else                              orb = <OrbParticles speaking={speaking} waveStyle={waveStyle} />;
  return (
    <div className="cv-b-orb-stack">
      {orb}
      <OrbCaption speaking={speaking} />
    </div>
  );
}

function DirectionB({ orbVariant = "particles", orbSpeaking = false, orbWave = "ripple" } = {}) {
  const V = window.VIGNETTE;

  return (
    <div className="cv-root cv-b" data-screen-label="Direction B — Console">
      <style>{`
        .cv-b {
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        /* ── TOPBAR ───────────────────────────────────────────── */
        .cv-b-topbar {
          display: flex; align-items: center; justify-content: space-between;
          height: 56px;
          padding: 0 calc(28px * var(--cv-pad));
          border-bottom: 1px solid var(--cv-line-soft);
          background: var(--cv-bg-2);
        }
        .cv-b-brand { display: flex; align-items: center; gap: 14px; }
        .cv-b-brand-mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: var(--cv-accent);
          color: var(--cv-accent-fg);
          display: grid; place-items: center;
        }
        .cv-b-brand-text {
          font: 500 13px/1.2 var(--cv-sans);
          letter-spacing: -0.005em;
        }
        .cv-b-brand-text small {
          display: block;
          font: 500 10px/1.4 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .cv-b-stepper {
          display: flex; align-items: center; gap: 10px;
          font: 500 11px/1 var(--cv-mono);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cv-fg-dim);
        }
        .cv-b-step {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px; border-radius: 999px;
        }
        .cv-b-step.active {
          background: var(--cv-bg-3);
          color: var(--cv-fg);
        }
        .cv-b-step .num {
          width: 18px; height: 18px; border-radius: 999px;
          background: var(--cv-bg-3);
          color: var(--cv-fg-mut);
          display: grid; place-items: center;
          font: 500 10px/1 var(--cv-mono);
        }
        .cv-b-step.active .num { background: var(--cv-accent); color: var(--cv-accent-fg); }
        .cv-b-step .line {
          width: 22px; height: 1px; background: var(--cv-line);
        }

        .cv-b-userwrap { display: flex; align-items: center; gap: 12px; }
        .cv-b-avatar {
          width: 30px; height: 30px; border-radius: 999px;
          background: var(--cv-bg-3);
          border: 1px solid var(--cv-line);
          display: grid; place-items: center;
          font: 500 11px/1 var(--cv-sans);
          color: var(--cv-fg);
        }
        .cv-b-user {
          font: 500 12px/1.2 var(--cv-sans);
        }
        .cv-b-user small {
          display: block;
          font: 500 10px/1.2 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        /* ── BODY ─────────────────────────────────────────────── */
        .cv-b-body {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 0;
          min-height: 0;
        }
        .cv-b-left {
          padding: calc(24px * var(--cv-pad)) calc(48px * var(--cv-pad));
          display: flex; flex-direction: column;
          gap: calc(14px * var(--cv-pad));
          border-right: 1px solid var(--cv-line-soft);
          min-width: 0;
        }
        .cv-b-left-top {
          flex-shrink: 0;
        }
        .cv-b-left-orb {
          flex: 1;
          display: grid;
          place-items: center;
          min-height: 0;
        }
        .cv-b-left-bottom {
          flex-shrink: 0;
          display: flex; flex-direction: column;
          gap: calc(10px * var(--cv-pad));
        }
        .cv-b-right {
          padding: calc(24px * var(--cv-pad)) calc(36px * var(--cv-pad));
          overflow: hidden;
          background:
            linear-gradient(180deg, var(--cv-bg) 0%, var(--cv-bg-2) 100%);
        }

        .cv-b-kicker {
          font: 500 10.5px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .cv-b-title {
          font: 500 34px/1.08 var(--cv-sans);
          letter-spacing: -0.025em;
          margin-top: 12px;
          color: var(--cv-fg);
          max-width: 18ch;
        }
        .cv-b-title .accent {
          color: var(--cv-accent);
        }
        .cv-b-lede {
          font-size: 14px;
          line-height: 1.55;
          color: var(--cv-fg-mut);
          margin-top: 14px;
          max-width: 46ch;
        }

        /* ── JARVIS ORB ──────────────────────────────────────── */
        .cv-b-orb-wrap {
          position: relative;
          width: 320px; height: 320px;
          color: var(--cv-accent);
          display: grid; place-items: center;
        }
        .cv-b-orb-halo, .cv-b-orb-halo2 {
          position: absolute; inset: 0;
          border-radius: 999px;
          pointer-events: none;
        }
        .cv-b-orb-halo {
          background: radial-gradient(circle at 50% 50%,
            var(--cv-accent) 0%,
            var(--cv-accent-soft) 30%,
            transparent 60%);
          filter: blur(28px);
          opacity: 0.7;
          animation: cvBreathe 5s ease-in-out infinite;
        }
        .cv-b-orb-halo2 {
          inset: -24px;
          background: radial-gradient(circle at 50% 50%,
            var(--cv-accent-soft) 0%,
            transparent 50%);
          filter: blur(40px);
          opacity: 0.55;
          animation: cvBreathe2 7s ease-in-out infinite;
        }
        .cv-b-orb-arc {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          transform-origin: 50% 50%;
        }
        .cv-b-orb-arc-out { animation: cvSpin 22s linear infinite; }
        .cv-b-orb-arc-in  { animation: cvSpinR 14s linear infinite; }

        .cv-b-orb-lat {
          position: absolute;
          left: 50%; top: 50%;
          width: 168px; height: 30px;
          border: 1px solid var(--cv-accent);
          border-radius: 999px;
          transform: translate(-50%, -50%) rotate(-12deg);
          opacity: 0.35;
          pointer-events: none;
        }

        .cv-b-orb-sphere {
          position: relative;
          width: 156px; height: 156px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 35% 32%,
              color-mix(in oklab, var(--cv-accent) 70%, white 30%) 0%,
              var(--cv-accent) 22%,
              color-mix(in oklab, var(--cv-accent) 50%, black 50%) 70%,
              color-mix(in oklab, var(--cv-accent) 30%, black 70%) 100%);
          box-shadow:
            0 0 60px var(--cv-accent-soft),
            inset 0 -16px 24px color-mix(in oklab, var(--cv-accent) 30%, black 70%),
            inset 0 12px 20px color-mix(in oklab, var(--cv-accent) 40%, white 30%);
          animation: cvBreathe 4.2s ease-in-out infinite;
        }
        .cv-b-orb-sphere-shine {
          position: absolute;
          top: 14px; left: 28px;
          width: 44px; height: 26px;
          border-radius: 999px;
          background: radial-gradient(ellipse at center,
            rgba(255,255,255,0.65) 0%,
            rgba(255,255,255,0) 70%);
          filter: blur(1px);
          pointer-events: none;
        }
        .cv-b-orb-sphere-core {
          position: absolute;
          left: 50%; top: 50%;
          width: 18px; height: 18px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: rgba(255,255,255,0.85);
          box-shadow: 0 0 18px rgba(255,255,255,0.6);
          animation: cvBreathe 2.4s ease-in-out infinite;
        }

        .cv-b-orb-wave {
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          display: flex; align-items: center; gap: 4px;
          height: 24px;
          mix-blend-mode: screen;
          opacity: 0.0;  /* faint, sits behind the core highlight */
          pointer-events: none;
        }
        .cv-b-orb-wave span {
          width: 2px; border-radius: 2px;
          background: rgba(255,255,255,0.9);
          transform-origin: center;
        }

        .cv-b-orb-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .cv-b-orb-caption {
          display: inline-flex; align-items: center; gap: 8px;
          font: 500 11px/1 var(--cv-mono);
          color: var(--cv-fg-mut);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .cv-b-orb-dot {
          width: 6px; height: 6px; border-radius: 999px;
          background: var(--cv-accent);
          box-shadow: 0 0 0 4px var(--cv-accent-soft);
          animation: cvBreathe 1.6s ease-in-out infinite;
        }

        @keyframes cvSpin  { to { transform: rotate(360deg); } }
        @keyframes cvSpinR { to { transform: rotate(-360deg); } }

        /* ── PARTICLES variant ───────────────────────────────── */
        /* Accent-colored particles forming concentric wavy rings.
           Works in both light + dark mode because color is driven
           by --cv-accent. */
        .orb-particles { color: var(--cv-accent); }
        .orb-p-ring {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          transform-origin: 50% 50%;
          filter:
            drop-shadow(0 0 1px var(--cv-accent))
            drop-shadow(0 0 6px var(--cv-accent-soft));
          transition: filter .6s ease;
        }
        .orb-particles[data-speaking="yes"] .orb-p-ring {
          filter:
            drop-shadow(0 0 1.5px var(--cv-accent))
            drop-shadow(0 0 8px var(--cv-accent-soft))
            drop-shadow(0 0 18px var(--cv-accent-soft));
        }
        .orb-p-ring-0 { animation: cvSpin  44s linear infinite; }
        .orb-p-ring-1 { animation: cvSpinR 32s linear infinite; opacity: 0.85; }
        .orb-p-ring-2 { animation: cvSpin  26s linear infinite; opacity: 0.7; }
        .orb-p-core {
          position: absolute;
          left: 50%; top: 50%;
          width: 28px; height: 28px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          border: 1px solid var(--cv-accent-soft);
          background:
            radial-gradient(circle,
              var(--cv-accent-soft) 0%,
              transparent 70%);
          animation: cvBreathe 4.4s ease-in-out infinite;
          pointer-events: none;
        }

        /* ── PLASMA variant ──────────────────────────────────── */
        .orb-plasma-mask {
          position: absolute; inset: 10px;
          border-radius: 999px;
          overflow: hidden;
          isolation: isolate;
        }
        .orb-plasma-blob {
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 999px;
          filter: blur(34px);
          mix-blend-mode: screen;
        }
        .orb-plasma-blob.b1 {
          left: -10%; top: -5%;
          background: radial-gradient(circle, var(--cv-accent) 0%, transparent 65%);
          animation: orbDrift1 11s ease-in-out infinite;
          opacity: 0.95;
        }
        .orb-plasma-blob.b2 {
          right: -15%; top: 10%;
          background: radial-gradient(circle,
            color-mix(in oklab, var(--cv-accent) 70%, white 30%) 0%,
            transparent 65%);
          animation: orbDrift2 9s ease-in-out infinite;
          opacity: 0.85;
        }
        .orb-plasma-blob.b3 {
          left: 20%; bottom: -20%;
          background: radial-gradient(circle,
            color-mix(in oklab, var(--cv-accent) 60%, black 40%) 0%,
            transparent 65%);
          animation: orbDrift3 13s ease-in-out infinite;
          opacity: 0.9;
        }
        .orb-plasma-blob.b4 {
          right: 5%; bottom: 5%;
          width: 120px; height: 120px;
          background: radial-gradient(circle,
            color-mix(in oklab, var(--cv-accent) 80%, white 20%) 0%,
            transparent 65%);
          animation: orbDrift1 7s ease-in-out -2s infinite;
          opacity: 0.7;
        }
        .orb-plasma-grain {
          position: absolute; inset: 0;
          border-radius: 999px;
          background:
            radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.35) 100%);
          pointer-events: none;
        }
        .orb-plasma-core {
          position: absolute;
          left: 50%; top: 50%;
          width: 14px; height: 14px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 20px rgba(255,255,255,0.6),
                      0 0 40px var(--cv-accent);
          animation: cvBreathe 2.4s ease-in-out infinite;
        }
        @keyframes orbDrift1 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(20px, -16px); }
        }
        @keyframes orbDrift2 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(-22px, 18px); }
        }
        @keyframes orbDrift3 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(14px, -22px); }
        }

        /* ── WIREFRAME variant ───────────────────────────────── */
        .orb-wire { color: var(--cv-accent); }
        .orb-wire-tilt {
          position: absolute; inset: 0;
          transform: rotateZ(-12deg);
          animation: cvSpin 32s linear infinite;
        }
        .orb-wire-svg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          color: var(--cv-accent);
        }
        .orb-wire-ticks {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          color: var(--cv-accent);
          animation: cvSpinR 40s linear infinite;
          opacity: 0.7;
        }
        .orb-wire-core {
          position: absolute;
          left: 50%; top: 50%;
          width: 22px; height: 22px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(circle,
            rgba(255,255,255,0.95) 0%,
            var(--cv-accent) 40%,
            transparent 90%);
          box-shadow: 0 0 30px var(--cv-accent),
                      0 0 60px var(--cv-accent-soft);
          animation: cvBreathe 2.6s ease-in-out infinite;
        }

        /* ── IRIS variant ────────────────────────────────────── */
        .orb-iris { color: var(--cv-accent); }
        .orb-iris-ring {
          position: absolute;
          left: 50%; top: 50%;
          border-radius: 999px;
          border: 1px solid var(--cv-accent);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .orb-iris-ring.r1 { width: 320px; height: 320px; opacity: 0.18; }
        .orb-iris-ring.r2 { width: 260px; height: 260px; opacity: 0.30; }
        .orb-iris-ring.r3 { width: 200px; height: 200px; opacity: 0.45; }
        .orb-iris-ring.r4 {
          width: 140px; height: 140px; opacity: 0.65;
          animation: cvBreathe 4.2s ease-in-out infinite;
        }
        .orb-iris-center {
          position: absolute;
          left: 50%; top: 50%;
          width: 64px; height: 64px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(circle,
            var(--cv-accent) 0%,
            var(--cv-accent-soft) 60%,
            transparent 100%);
          filter: blur(2px);
          animation: cvBreathe 3.4s ease-in-out infinite;
          pointer-events: none;
        }
        .orb-iris-arc {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          animation: cvSpin 28s linear infinite;
        }
        .orb-iris-arc-2 { animation: cvSpinR 18s linear infinite; opacity: 0.7; }
        .orb-iris-wave {
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          display: flex; align-items: center; gap: 4px;
          height: 30px;
          z-index: 3;
        }
        .orb-iris-wave span {
          width: 2px; border-radius: 2px;
          background: rgba(255,255,255,0.95);
          transform-origin: center;
          box-shadow: 0 0 6px var(--cv-accent);
        }
        .orb-iris-core {
          position: absolute;
          left: 50%; top: 50%;
          width: 6px; height: 6px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 0 10px rgba(255,255,255,0.7);
          z-index: 1;
        }

        /* mic + meter card */
        .cv-b-mic-card {
          background: var(--cv-bg-2);
          border: 1px solid var(--cv-line-soft);
          border-radius: var(--cv-radius);
          padding: 20px;
          display: flex; align-items: center; gap: 18px;
        }
        .cv-b-mic-orb {
          width: 56px; height: 56px;
          border-radius: 999px;
          background: var(--cv-accent-soft);
          border: 1px solid var(--cv-accent);
          color: var(--cv-accent);
          display: grid; place-items: center;
          flex-shrink: 0;
          position: relative;
        }
        .cv-b-mic-orb::after {
          content: "";
          position: absolute; inset: -6px;
          border-radius: 999px;
          border: 1px solid var(--cv-accent-soft);
          animation: cvBreathe 3s ease-in-out infinite;
        }
        .cv-b-mic-body { flex: 1; min-width: 0; }
        .cv-b-mic-label {
          font: 500 11px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .cv-b-mic-name {
          margin-top: 6px;
          font: 500 13px/1.2 var(--cv-sans);
          letter-spacing: -0.005em;
          display: flex; align-items: center; gap: 8px;
        }
        .cv-b-mic-name .pill {
          font: 500 9px/1 var(--cv-mono);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cv-accent);
          background: var(--cv-accent-soft);
          padding: 3px 6px; border-radius: 4px;
        }
        .cv-b-meter {
          display: flex; align-items: center; gap: 2px;
          height: 40px; margin-top: 10px;
        }
        .cv-b-meter span {
          width: 3px; border-radius: 2px;
          background: var(--cv-accent);
          transform-origin: center;
          opacity: 0.85;
        }
        .cv-b-meter span:nth-child(3n) { opacity: 0.6; }
        .cv-b-meter span:nth-child(5n) { opacity: 0.4; }

        .cv-b-change {
          font: 500 11px/1 var(--cv-mono);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--cv-fg-mut);
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid var(--cv-line-soft);
          background: transparent;
          flex-shrink: 0;
        }
        .cv-b-change:hover { background: var(--cv-bg-3); color: var(--cv-fg); }

        /* expectations row */
        .cv-b-expect {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--cv-line-soft);
          border: 1px solid var(--cv-line-soft);
          border-radius: var(--cv-radius);
          overflow: hidden;
        }
        .cv-b-expect > div {
          background: var(--cv-bg-2);
          padding: 18px 18px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .cv-b-expect-k {
          font: 500 10px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .cv-b-expect-v {
          font: 500 24px/1 var(--cv-sans);
          letter-spacing: -0.02em;
          color: var(--cv-fg);
          font-variant-numeric: tabular-nums;
        }
        .cv-b-expect-v small {
          font: 400 12px/1 var(--cv-sans);
          color: var(--cv-fg-mut);
          letter-spacing: 0;
          text-transform: none;
          margin-left: 4px;
        }
        .cv-b-expect-help {
          font-size: 11.5px; line-height: 1.4;
          color: var(--cv-fg-mut);
        }

        /* CTA */
        .cv-b-cta-row {
          display: flex; gap: 14px; align-items: center;
          justify-content: center;
          margin-top: 4px;
        }
        .cv-b-help {
          font-size: 11.5px;
          line-height: 1.4;
          color: var(--cv-fg-dim);
          max-width: 58ch;
          text-align: center;
          margin: 0 auto;
          text-wrap: pretty;
        }

        /* ── VIGNETTE PANEL ───────────────────────────────────── */
        .cv-b-chart {
          background: var(--cv-bg-2);
          border: 1px solid var(--cv-line-soft);
          border-radius: var(--cv-radius);
          padding: 22px 24px 18px;
          height: 100%;
          display: flex; flex-direction: column;
          min-height: 0;
        }
        .cv-b-chart-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--cv-line-soft);
          gap: 16px;
        }
        .cv-b-chart-id {
          font: 500 10px/1 var(--cv-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cv-fg-dim);
          margin-bottom: 8px;
        }
        .cv-b-chart-title {
          font: 500 18px/1.2 var(--cv-sans);
          letter-spacing: -0.015em;
          color: var(--cv-fg);
        }
        .cv-b-chart-chief {
          font-family: var(--cv-serif);
          font-style: italic;
          font-size: 13.5px;
          line-height: 1.45;
          color: var(--cv-fg-mut);
          margin: 4px 0 0;
          max-width: 42ch;
        }
        .cv-b-chart-stamp {
          font: 500 10px/1.3 var(--cv-mono);
          color: var(--cv-accent);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-align: right;
          flex-shrink: 0;
        }
        .cv-b-chart-stamp small {
          display: block;
          color: var(--cv-fg-dim);
          margin-top: 4px;
        }

        .cv-b-chart-narrative {
          padding-top: 22px;
          display: flex; flex-direction: column;
          gap: 14px;
          flex: 1;
          min-height: 0;
        }
        .cv-b-chart-narrative p {
          margin: 0;
          font-family: var(--cv-serif);
          font-size: 16px;
          line-height: 1.6;
          color: var(--cv-fg);
          letter-spacing: -0.003em;
          text-wrap: pretty;
        }
        .cv-b-chart-narrative p:first-child::first-letter {
          color: var(--cv-accent);
          font-weight: 500;
        }

        /* ── SOURCE BLOCKS ───────────────────────────────────── */
        .cv-b-chart-sources {
          padding-top: 10px;
          display: flex; flex-direction: column;
          gap: 8px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        .cv-b-chart-sources::-webkit-scrollbar { width: 0; }
        .cv-b-src {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3px;
          padding: 8px 0 0;
          border-top: 1px solid var(--cv-line-soft);
        }
        .cv-b-src:first-child { border-top: 0; padding-top: 2px; }
        .cv-b-src-label {
          font: 500 9.5px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .cv-b-src-body {
          margin: 0;
          font-family: var(--cv-serif);
          font-size: 13px;
          line-height: 1.5;
          color: var(--cv-fg);
          letter-spacing: -0.003em;
          text-wrap: pretty;
        }
        .cv-b-src-hl {
          border-top: 0;
          margin-top: 2px;
          padding: 10px 12px;
          background: var(--cv-accent-soft);
          border: 1px solid var(--cv-accent);
          border-radius: var(--cv-radius-sm);
        }
        .cv-b-src-hl .cv-b-src-label {
          color: var(--cv-accent);
        }

        .cv-b-vitals {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          margin: 18px 0 14px;
        }
        .cv-b-vitals > div {
          padding: 8px 12px;
          border-right: 1px solid var(--cv-line-soft);
        }
        .cv-b-vitals > div:first-child { padding-left: 0; }
        .cv-b-vitals > div:last-child  { border-right: 0; padding-right: 0; }
        .cv-b-vitals-k {
          font: 500 9.5px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .cv-b-vitals-v {
          margin-top: 6px;
          font: 500 16px/1 var(--cv-sans);
          color: var(--cv-fg);
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.01em;
        }

        .cv-b-section {
          padding: 12px 0;
          border-top: 1px solid var(--cv-line-soft);
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 18px;
          align-items: baseline;
        }
        .cv-b-section-k {
          font: 500 10px/1.3 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .cv-b-section-v {
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--cv-fg);
        }
        .cv-b-flag {
          display: inline-flex; align-items: center; gap: 4px;
          color: var(--cv-accent);
          font: 500 10px/1 var(--cv-mono);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 6px;
          background: var(--cv-accent-soft);
          border-radius: 4px;
          margin-left: 6px;
          vertical-align: 1px;
        }

        /* ── STATUS BAR ───────────────────────────────────────── */
        .cv-b-statusbar {
          display: flex; align-items: center; justify-content: space-between;
          height: 32px;
          padding: 0 calc(28px * var(--cv-pad));
          border-top: 1px solid var(--cv-line-soft);
          background: var(--cv-bg-2);
          font: 500 11px/1 var(--cv-mono);
          color: var(--cv-fg-dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cv-b-statusbar .dot {
          display: inline-block;
          width: 6px; height: 6px; border-radius: 999px;
          background: var(--cv-accent);
          margin-right: 6px;
          box-shadow: 0 0 0 3px var(--cv-accent-soft);
        }
        .cv-b-statusbar span + span { margin-left: 16px; }
      `}</style>

      {/* TOPBAR */}
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

        <div className="cv-b-userwrap">
          <div className="cv-b-user" style={{ textAlign: "right" }}>
            Dr. Amara Okafor
            <small>Attending · MRN-issued</small>
          </div>
          <div className="cv-b-avatar">AO</div>
        </div>
      </div>

      {/* BODY */}
      <div className="cv-b-body">
        {/* LEFT */}
        <div className="cv-b-left">
          <div className="cv-b-left-top">
            <div className="cv-b-kicker">Session 014 · Ready</div>
            <h1 className="cv-b-title">
              Capture your <span className="accent">documentation voice</span>.
            </h1>
            <p className="cv-b-lede">
              Dictate your <em>HPI and Assessment &amp; Plan</em> for the case at right as you normally would. I&rsquo;ll then ask a few questions about your construction choices &mdash; structure, framing, omissions &mdash; to learn how <em>you</em> write.
            </p>
          </div>

          <div className="cv-b-left-orb">
            <JarvisOrb variant={orbVariant} speaking={orbSpeaking} waveStyle={orbWave} />
          </div>

          <div className="cv-b-left-bottom">
            <div className="cv-b-cta-row">
              <button className="cv-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 4 20 12 6 20 6 4"/>
                </svg>
                Begin dictation
              </button>
            </div>

            <p className="cv-b-help">
              Recordings processed in-session and discarded — only the Voice Profile is retained.
            </p>
          </div>
        </div>

        {/* RIGHT — CHART */}
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
                <div
                  key={i}
                  className={`cv-b-src ${s.highlight ? "cv-b-src-hl" : ""}`}
                >
                  <div className="cv-b-src-label">{s.label}</div>
                  <p className="cv-b-src-body">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="cv-b-statusbar">
        <div>
          <span><span className="dot"></span>Realtime · gpt-4o-realtime</span>
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

window.DirectionB = DirectionB;
window.JarvisOrb = JarvisOrb;
window.OrbParticles = OrbParticles;
