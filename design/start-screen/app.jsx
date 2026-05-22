/* ───────────────────────────────────────────────────────────────
   App shell — DesignCanvas with two artboards + Tweaks panel.
   Tweaks set data-theme / data-density / data-mode on each
   artboard wrapper so both directions stay in sync.
   ─────────────────────────────────────────────────────────────── */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "blue",
  "density": "comfortable",
  "mode": "light",
  "orb": "particles",
  "orbSpeaking": false,
  "orbWave": "ripple"
}/*EDITMODE-END*/;

// Curated accent swatches — hex previews approximated from the oklch
// values in styles.css so the TweakColor cards read accurately.
const THEME_OPTIONS = [
  "#4F7DD3", // blue
  "#71BBD0", // cyan
  "#E7A65A", // amber
  "#E08A6E", // coral
  "#7FB28F", // sage
];
const THEME_KEYS = ["blue", "cyan", "amber", "coral", "sage"];

function ThemedArtboard({ tweaks, children, label }) {
  return (
    <div
      data-theme={tweaks.theme}
      data-density={tweaks.density}
      data-mode={tweaks.mode}
      data-screen-label={label}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </div>
  );
}

function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // map hex → theme key for TweakColor
  const themeHex = THEME_OPTIONS[THEME_KEYS.indexOf(t.theme)] || THEME_OPTIONS[0];

  return (
    <>
      <window.DesignCanvas>
        <window.DCSection
          id="start-screen"
          title="Clinical Voice Interviewer — Start screen"
          subtitle="Two directions · physician in a hospital workstation context"
        >
          <window.DCArtboard
            id="atrium"
            label="A · Atrium — editorial, breathing rings"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="A · Atrium">
              <window.DirectionA />
            </ThemedArtboard>
          </window.DCArtboard>

          <window.DCArtboard
            id="console"
            label="B · Console — workspace, Jarvis orb"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="B · Console">
              <window.DirectionB
                orbVariant={t.orb}
                orbSpeaking={t.orbSpeaking}
                orbWave={t.orbWave}
              />
            </ThemedArtboard>
          </window.DCArtboard>
        </window.DCSection>

        <window.DCSection
          id="active-session"
          title="Active session — live transcript treatments"
          subtitle="Where & how the physician's words appear while they dictate"
        >
          <window.DCArtboard
            id="active-f1"
            label="F · Begin → active — orb to top-right corner (default)"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="F · Orb to corner">
              <window.BeginToActive placement="corner" />
            </ThemedArtboard>
          </window.DCArtboard>

          <window.DCArtboard
            id="active-f2"
            label="F · alt — orb under text box"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="F alt · Orb under text">
              <window.BeginToActive placement="bottom" />
            </ThemedArtboard>
          </window.DCArtboard>

          <window.DCArtboard
            id="active-e"
            label="E · Orb steps aside — transcript centered"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="E · Orb steps aside">
              <window.ActiveOrbAside />
            </ThemedArtboard>
          </window.DCArtboard>

          <window.DCArtboard
            id="active-a"
            label="A · Subtitle strip under orb"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="A · Subtitle">
              <window.ActiveSubtitle />
            </ThemedArtboard>
          </window.DCArtboard>

          <window.DCArtboard
            id="active-b"
            label="B · Document mode — right panel becomes the note"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="B · Document mode">
              <window.ActiveDocument />
            </ThemedArtboard>
          </window.DCArtboard>

          <window.DCArtboard
            id="active-c"
            label="C · Teleprompter band at bottom"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="C · Teleprompter">
              <window.ActiveTeleprompter />
            </ThemedArtboard>
          </window.DCArtboard>

          <window.DCArtboard
            id="active-d"
            label="D · Floating sentence stack"
            width={1280}
            height={800}
          >
            <ThemedArtboard tweaks={t} label="D · Floating stack">
              <window.ActiveFloating />
            </ThemedArtboard>
          </window.DCArtboard>
        </window.DCSection>
      </window.DesignCanvas>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="AI orb (Console)" />
        <window.TweakSelect
          label="Style"
          value={t.orb}
          options={[
            { value: "particles", label: "Particles · wavy ring" },
            { value: "plasma",    label: "Plasma · drifting bloom" },
            { value: "wireframe", label: "Wireframe · Jarvis globe" },
            { value: "iris",      label: "Iris · sensor aperture" },
            { value: "sphere",    label: "Sphere · photoreal" },
          ]}
          onChange={(v) => setTweak("orb", v)}
        />
        <window.TweakToggle
          label="Speaking"
          value={t.orbSpeaking}
          onChange={(v) => setTweak("orbSpeaking", v)}
        />
        <window.TweakRadio
          label="Wave style"
          value={t.orbWave}
          options={["gentle", "ripple", "pulse"]}
          onChange={(v) => setTweak("orbWave", v)}
        />
        <window.TweakSection label="Theme" />
        <window.TweakColor
          label="Accent"
          value={themeHex}
          options={THEME_OPTIONS}
          onChange={(hex) => {
            const idx = THEME_OPTIONS.indexOf(hex);
            if (idx >= 0) setTweak("theme", THEME_KEYS[idx]);
          }}
        />
        <window.TweakRadio
          label="Mode"
          value={t.mode}
          options={["dark", "light"]}
          onChange={(v) => setTweak("mode", v)}
        />
        <window.TweakSection label="Layout" />
        <window.TweakRadio
          label="Density"
          value={t.density}
          options={["comfortable", "compact"]}
          onChange={(v) => setTweak("density", v)}
        />
      </window.TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
