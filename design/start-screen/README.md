# Clinical Voice Interviewer — Design Mockups

Hi-fi design exploration for the [Clinical Voice Interviewer](https://github.com/bcarley87/clinical-voice-interviewer) app — a voice-to-voice tool that captures a physician's clinical documentation voice and style.

These mockups are a single self-contained HTML prototype (React + Babel via CDN, no build step). They explore the start-screen visual direction and several treatments for displaying a live transcript during dictation.

---

## Running locally

No install required. Open the HTML file in any modern browser:

```bash
open "Clinical Voice Interviewer — Start screen.html"
```

> If your browser blocks `file://` script loading, serve the folder:
> ```bash
> python3 -m http.server 8000
> # then visit http://localhost:8000/Clinical%20Voice%20Interviewer%20%E2%80%94%20Start%20screen.html
> ```

The mockups are presented on a **design canvas** — pan with click-drag, zoom with the trackpad. Click the expand icon on any artboard's header to focus it fullscreen.

---

## What's in here

The canvas has two sections:

### 1 · Start screen — two directions

| Artboard | Direction | Feel |
|---|---|---|
| **A · Atrium** | Editorial single column with breathing concentric rings + serif headline | Calm, journal-like |
| **B · Console** | Two-column workspace with a Jarvis-style particle orb + structured case panel | Enterprise, "cockpit" |

The clinical case (radiation oncology consult — biopsy-confirmed left tonsillar SCC, T2 N2a M0) appears on the right of both directions as a stack of six labeled source-document blocks: ENT Referral Note → PET/CT → MRI → Med-Onc → Patient Chart → Your Encounter. "Your Encounter" gets an accent-colored highlight since it's the part most relevant to the dictation.

### 2 · Active session — live transcript treatments

Six artboards exploring **where & how the physician's words appear while they dictate**:

| Artboard | Treatment | Notes |
|---|---|---|
| **F · Begin → active (default)** | Interactive prototype. Orb shrinks to top-right corner; word-doc transcript fades into the center. Vignette stays on the right. | **Click "Begin dictation" to trigger the animation.** Click "End" to reverse. |
| **F · alt** | Same prototype, orb placement under the transcript box instead of in the corner | |
| **E · Orb steps aside** | Orb shrinks into a small corner pill; transcript fills the center as large serif text | Most documentation-first |
| **A · Subtitle strip** | 3-line cascading caption under a mid-sized orb | Older lines ghosted, current line bold |
| **B · Document mode** | Right panel becomes the growing HPI document | |
| **C · Teleprompter band** | Full-width caption band along the bottom of the screen | |
| **D · Floating stack** | Sentences pile up as cards beneath the orb, fading + shrinking as they age | |

---

## Tweaks panel

Toggle Tweaks on (via the design tool's toolbar) for live controls:

- **AI orb style** — Particles (default), Plasma, Wireframe, Iris, Sphere
- **Speaking** — toggle the orb between idle (nearly circular) and speaking (rippling rings)
- **Wave style** — Gentle / Ripple / Pulse (only visible when Speaking is on)
- **Accent color** — Blue (default), Cyan, Amber, Coral, Sage
- **Mode** — Light (default) or Dark
- **Density** — Comfortable or Compact

---

## File map

```
.
├── Clinical Voice Interviewer — Start screen.html   # entry point
├── styles.css                                        # shared theme tokens (oklch palettes, light/dark, type)
├── active-session.css                                # styles for the 7 active-session artboards
├── app.jsx                                           # canvas layout + Tweaks wiring
├── design-canvas.jsx                                 # pan/zoom canvas web component (starter)
├── tweaks-panel.jsx                                  # Tweaks shell + form controls (starter)
├── vignette-data.jsx                                 # the clinical case (shared across artboards)
├── direction-a.jsx                                   # Start screen — Atrium
├── direction-b.jsx                                   # Start screen — Console (incl. 5 orb variants)
└── active-session.jsx                                # 7 transcript treatments + animated prototype
```

---

## Design system notes

- **Color** is driven by CSS custom properties in `styles.css`. Light/dark and accent themes swap a small set of `--cv-*` variables; nothing else needs to change. Accent palettes are defined in `oklch()` for predictable lightness across hues.
- **Type** is Geist (matching the source repo) + Newsreader for editorial serif moments (lede copy, case narrative).
- **Particle orb** (`OrbParticles` in `direction-b.jsx`) generates ~530 SVG circles arranged in three concentric rings with sin-wave radius perturbation. At rest the rings are mathematically circular; when `speaking={true}`, a `requestAnimationFrame` loop modulates each particle's radius live. Three wave styles ramp the amplitude/frequency from gentle to pulse.
- The same `OrbParticles` is scaled down to fit the corner pill in the active-session prototype, so the orb keeps the same DNA at any size.

---

## Source case (for reference)

The vignette in `vignette-data.jsx` is a synthetic radiation oncology consult:

> 58-year-old male, radiation oncology consult.
> Definitive treatment discussion — left tonsillar SCC.
> ENT referral · biopsy-confirmed p16+ SCC, left tonsil, T2 N2a M0.
> PET/CT · 3.1 cm primary, level II node, no distant disease.
> Patient is anxious and well-informed; asking about long-term swallowing outcomes.

Swap this out in `vignette-data.jsx` to test against a different case.
