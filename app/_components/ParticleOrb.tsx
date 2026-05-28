"use client";

import { useEffect, useMemo, useRef } from "react";
import styles from "./ParticleOrb.module.css";

export type ParticleOrbProps = {
  speaking: boolean;
  waveStyle?: "gentle" | "ripple" | "pulse";
  size?: number;
};

const RENDER_SIZE = 320;

const RING_CONFIGS = [
  { n: 220, base: 90, freq: 7, phase: 0.0 },
  { n: 180, base: 78, freq: 5, phase: 1.7 },
  { n: 130, base: 64, freq: 9, phase: 0.8 },
];

export function ParticleOrb({ speaking, waveStyle = "ripple", size = 320 }: ParticleOrbProps) {
  const ringRefs = useRef<(SVGSVGElement | null)[]>([]);
  const stateRef = useRef({ speaking, waveStyle, amp: 0, lastSettled: false });

  useEffect(() => {
    stateRef.current.speaking = speaking;
    stateRef.current.waveStyle = waveStyle;
  }, [speaking, waveStyle]);

  const rings = useMemo(() => {
    return RING_CONFIGS.map((c) => {
      const angles: number[] = [];
      const props: { op: number; sz: number }[] = [];
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

  useEffect(() => {
    let raf: number;
    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - t0) / 1000;
      const s = stateRef.current;

      const targetAmp = s.speaking
        ? s.waveStyle === "gentle" ? 4 : s.waveStyle === "pulse" ? 13 : 8
        : 0;
      s.amp += (targetAmp - s.amp) * 0.05;

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
          let waveMod: number;
          if (s.waveStyle === "gentle") {
            waveMod = Math.sin(t * ring.freq + ring.phase + elapsed * 0.6);
          } else if (s.waveStyle === "pulse") {
            waveMod =
              Math.sin(t * ring.freq + ring.phase + elapsed * 2.2) +
              Math.sin(t * 13 + elapsed * 3.4) * 0.5;
          } else {
            waveMod =
              Math.sin(t * ring.freq + ring.phase + elapsed * 1.1) +
              Math.sin(t * ring.freq * 2.3 + ring.phase * 1.7 + elapsed * 0.7) * 0.4;
          }
          const r = ring.base + waveMod * s.amp;
          const x = 100 + Math.cos(t) * r;
          const y = 100 + Math.sin(t) * r;
          const c = circles[i] as Element | undefined;
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

  const scale = size / RENDER_SIZE;

  return (
    <div className={styles.outer} style={{ width: size, height: size }}>
      <div
        className={styles.orbWrap}
        data-speaking={speaking ? "yes" : "no"}
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div className={styles.halo} />

        {rings.map((ring, i) => (
          <svg
            key={i}
            ref={(el) => { ringRefs.current[i] = el; }}
            className={`${styles.ring} ${styles[`ring${i}` as keyof typeof styles]}`}
            viewBox="0 0 200 200"
            suppressHydrationWarning
          >
            {ring.angles.map((t, j) => (
              <circle
                key={j}
                cx={100 + Math.cos(t) * ring.base}
                cy={100 + Math.sin(t) * ring.base}
                r={ring.props[j].sz}
                fill="currentColor"
                opacity={ring.props[j].op}
              />
            ))}
          </svg>
        ))}

        <div className={styles.core} />
      </div>
    </div>
  );
}
