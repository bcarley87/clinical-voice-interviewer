"use client";

import type { TranscriptMessage, VoiceActivity } from "@/hooks/useRealtimeSession";
import { ParticleOrb } from "./ParticleOrb";
import { WordDocTranscript } from "./WordDocTranscript";
import { Topbar } from "./Topbar";
import { StatusBar } from "./StatusBar";
import { CaseVignette } from "./CaseVignette";
import styles from "./SessionShell.module.css";

interface SessionShellProps {
  isActive: boolean;
  isConnecting: boolean;
  voiceActivity: VoiceActivity;
  messages: TranscriptMessage[];
  elapsedSeconds: number;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export function SessionShell({
  isActive,
  isConnecting,
  voiceActivity,
  messages,
  elapsedSeconds,
  error,
  onStart,
  onStop,
}: SessionShellProps) {
  const speaking = voiceActivity === "user_speaking";
  const userMessages = messages.filter((m) => m.role === "user");

  return (
    <div className={styles.root}>
      <Topbar isActive={isActive} elapsedSeconds={elapsedSeconds} onStop={onStop} />

      <div className={styles.body}>
        {/* Left column */}
        <div className={styles.left} data-active={isActive ? "yes" : "no"}>
          {/* Corner pill — fades in on active */}
          <div className={styles.cornerPill}>
            <div className={styles.cornerOrbClip}>
              <ParticleOrb speaking={speaking} waveStyle="gentle" size={56} />
            </div>
            <span className={styles.cornerStatus}>
              <span className={styles.orbDot} />
              {voiceActivity === "ai_speaking" ? "AI speaking" : "Listening"}
            </span>
          </div>

          {/* Header — collapses on active */}
          <div className={styles.header}>
            <div className={styles.kicker}>Session 014 · {isActive ? "Recording" : "Ready"}</div>
            <h1 className={styles.title}>
              Capture your <span className={styles.accent}>documentation voice</span>.
            </h1>
            <p className={styles.lede}>
              Dictate your <em>HPI and Assessment &amp; Plan</em> for the case at right as you
              normally would. I&rsquo;ll then ask a few questions about your construction choices.
            </p>
          </div>

          {/* Stage — orb fades out, transcript fades in */}
          <div className={styles.stage}>
            <div className={styles.orbFrame}>
              <ParticleOrb speaking={speaking} />
            </div>
            <WordDocTranscript isActive={isActive} messages={userMessages} />
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            {isActive ? (
              <p className={styles.footNote}>Recording · voice profile capture in progress</p>
            ) : (
              <>
                {error && <div className={styles.error}>{error}</div>}
                <button
                  className={styles.startBtn}
                  onClick={onStart}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    "Connecting…"
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                      Begin dictation
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right column — case vignette, unchanged across states */}
        <div className={styles.right}>
          <CaseVignette />
        </div>
      </div>

      <StatusBar isActive={isActive} />
    </div>
  );
}
