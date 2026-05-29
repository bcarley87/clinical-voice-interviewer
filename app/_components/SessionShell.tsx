"use client";

import { useEffect, useRef, useState } from "react";
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
  isReview?: boolean;
  voiceActivity: VoiceActivity;
  messages: TranscriptMessage[];
  aiPartial?: string;
  formattedNote?: string;
  elapsedSeconds: number;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  onConfirm?: (note: string, messages: TranscriptMessage[]) => void;
}

export function SessionShell({
  isActive,
  isConnecting,
  isReview = false,
  voiceActivity,
  messages,
  aiPartial = "",
  formattedNote = "",
  elapsedSeconds,
  error,
  onStart,
  onStop,
  onConfirm,
}: SessionShellProps) {
  const speaking = voiceActivity === "user_speaking";
  const columnActive = isActive || isReview;

  const [editedNote, setEditedNote] = useState("");
  const noteInitialized = useRef(false);

  useEffect(() => {
    if (isReview && formattedNote && !noteInitialized.current) {
      noteInitialized.current = true;
      setEditedNote(formattedNote);
    }
    if (!isReview) {
      noteInitialized.current = false;
    }
  }, [isReview, formattedNote]);

  return (
    <div className={styles.root}>
      <Topbar isActive={isActive} elapsedSeconds={elapsedSeconds} />

      <div className={styles.body}>
        {/* Left column */}
        <div className={styles.left} data-active={columnActive ? "yes" : "no"}>
          {/* Corner pill */}
          <div className={styles.cornerPill}>
            <div className={styles.cornerOrbClip}>
              <ParticleOrb speaking={speaking} waveStyle="gentle" size={56} />
            </div>
            <span className={styles.cornerStatus}>
              <span className={styles.orbDot} />
              {voiceActivity === "ai_speaking" ? "AI speaking" : "Listening"}
            </span>
          </div>

          {/* Header */}
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

          {/* Stage */}
          <div className={styles.stage}>
            <div className={styles.orbFrame}>
              <ParticleOrb speaking={speaking} />
            </div>
            <WordDocTranscript
              isActive={isActive}
              isEditing={isReview}
              messages={messages}
              aiPartial={aiPartial}
              editedNote={editedNote}
              onNoteChange={setEditedNote}
            />
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            {isReview ? (
              <button
                className={styles.confirmBtn}
                onClick={() => onConfirm?.(editedNote, messages)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                Generate my profile
              </button>
            ) : isActive ? (
              <button className={styles.wrapUpBtn} onClick={onStop}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="1.5" />
                </svg>
                Wrap up session
              </button>
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

        {/* Right column */}
        <div className={styles.right}>
          <CaseVignette />
        </div>
      </div>

      <StatusBar isActive={isActive} />
    </div>
  );
}
