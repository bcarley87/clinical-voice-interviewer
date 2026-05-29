"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Download, Copy, Check, RefreshCw } from "lucide-react";
import {
  useRealtimeSession,
  type TranscriptMessage,
} from "@/hooks/useRealtimeSession";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SessionShell } from "./_components/SessionShell";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
    >
      {state === "copied" ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          Copied!
        </>
      ) : state === "error" ? (
        <>
          <Copy className="w-3.5 h-3.5 text-destructive" />
          Failed
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

function WelcomeScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--card)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "var(--primary)",
              boxShadow: "0 0 0 4px var(--accent-soft)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--foreground)",
            }}
          >
            Clinical Voice Interviewer
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--muted-foreground)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          St. Mercy Health · Rad-Onc
        </span>
      </div>

      {/* Main — centered */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              marginBottom: 20,
            }}
          >
            St. Mercy Rad-Onc
          </div>

          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 52,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              margin: "0 0 14px",
              color: "var(--foreground)",
            }}
          >
            Welcome.
          </h1>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 17,
              fontWeight: 400,
              color: "var(--muted-foreground)",
              letterSpacing: "-0.01em",
              margin: "0 0 44px",
            }}
          >
            Let&rsquo;s capture your documentation voice.
          </p>

          <button
            onClick={onBegin}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 52,
              padding: "0 36px",
              borderRadius: 999,
              border: "1px solid transparent",
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              cursor: "pointer",
              boxShadow: "0 0 0 6px var(--accent-soft), 0 18px 40px -20px var(--primary)",
            }}
          >
            Begin
          </button>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              color: "var(--dim-foreground)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: 22,
            }}
          >
            HIPAA-secure · Recordings discarded after session
          </p>
        </div>
      </div>
    </div>
  );
}

function FormattingScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        gap: 16,
        background: "var(--background)",
      }}
    >
      <Loader2 style={{ width: 28, height: 28, animation: "spin 1s linear infinite", color: "var(--muted-foreground)" }} />
      <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}>
        Formatting your note…
      </p>
    </div>
  );
}

function SessionEnded({
  formattedNote,
  messages,
  elapsedSeconds,
}: {
  formattedNote: string;
  messages: TranscriptMessage[];
  elapsedSeconds: number;
}) {
  const [profileState, setProfileState] = useState<"idle" | "loading" | "done" | "error">("loading");
  const [compressState, setCompressState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [fullProfile, setFullProfile] = useState("");
  const [compressedProfile, setCompressedProfile] = useState("");
  const [profileError, setProfileError] = useState("");
  const [compressError, setCompressError] = useState("");
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const generationStarted = useRef(false);

  const runCompression = useCallback(async (profile: string) => {
    setCompressState("loading");
    setCompressError("");
    try {
      const res = await fetch("/api/compress-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = (await res.json()) as { compressed?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `${res.status}`);
      setCompressedProfile(data.compressed ?? "");
      setCompressState("done");
    } catch (err) {
      setCompressError(err instanceof Error ? err.message : "Compression failed");
      setCompressState("error");
    }
  }, []);

  useEffect(() => {
    if (generationStarted.current) return;
    generationStarted.current = true;

    (async () => {
      try {
        const res = await fetch("/api/generate-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formattedNote, messages }),
        });
        const data = (await res.json()) as { profile?: string; error?: string };
        if (!res.ok || data.error) throw new Error(data.error ?? `${res.status}`);
        const profile = data.profile ?? "";
        setFullProfile(profile);
        setProfileState("done");
        runCompression(profile);
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : "Profile generation failed");
        setProfileState("error");
      }
    })();
  }, [messages, runCompression]);

  const timestamp = useRef(
    new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
  ).current;

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xs font-semibold text-foreground tracking-widest uppercase">
              Voice Profile Ready
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {messages.length} exchanges · {formatTime(elapsedSeconds)}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Session
          </button>
        </div>
      </header>

      <div className="shrink-0 border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 flex gap-0">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 1
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Full Voice Profile
          </button>
          <button
            onClick={() => compressState === "done" && setActiveTab(2)}
            disabled={compressState !== "done"}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 2
                ? "border-primary text-foreground"
                : compressState === "done"
                ? "border-transparent text-muted-foreground hover:text-foreground"
                : "border-transparent text-muted-foreground/40 cursor-not-allowed"
            }`}
          >
            AI-Ready Profile
            {compressState === "loading" && (
              <Loader2 className="inline-block w-3 h-3 ml-1.5 animate-spin" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {activeTab === 1 && (
            <>
              {profileState === "loading" && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground py-8">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating your voice profile…
                </div>
              )}
              {profileState === "error" && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {profileError}
                </div>
              )}
              {profileState === "done" && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <CopyButton text={fullProfile} />
                    <button
                      onClick={() => downloadFile(fullProfile, `voice_profile_${timestamp}.md`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {fullProfile}
                    </ReactMarkdown>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 2 && (
            <>
              {compressState === "loading" && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground py-8">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compressing for AI use…
                </div>
              )}
              {compressState === "error" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {compressError}
                  </div>
                  <button
                    onClick={() => runCompression(fullProfile)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Compression
                  </button>
                </div>
              )}
              {compressState === "done" && (
                <>
                  <p className="text-xs text-muted-foreground mb-4">
                    Paste this into any AI session as standing context to
                    replicate this physician&apos;s documentation voice.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <CopyButton text={compressedProfile} />
                    <button
                      onClick={() => downloadFile(compressedProfile, `about_me_${timestamp}.md`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed bg-card border border-border rounded-lg p-4 overflow-x-auto">
                    {compressedProfile}
                  </pre>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    status,
    messages,
    aiPartial,
    voiceActivity,
    elapsedSeconds,
    error,
    start,
    stop,
    review,
    confirm,
  } = useRealtimeSession();

  const [showWelcome, setShowWelcome] = useState(true);
  const [formattedNote, setFormattedNote] = useState("");
  const [confirmedNote, setConfirmedNote] = useState("");
  const [confirmedMessages, setConfirmedMessages] = useState<TranscriptMessage[]>([]);

  // When stop() fires, status becomes "formatting" — run the format API then transition to review
  useEffect(() => {
    if (status !== "formatting") return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/format-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
        const data = (await res.json()) as { formatted?: string; error?: string };
        if (!res.ok || data.error) throw new Error(data.error ?? `${res.status}`);
        if (!cancelled) setFormattedNote(data.formatted ?? "");
      } catch {
        // Fallback to raw merged user text so the review step is never blocked
        const raw = messages
          .filter((m) => m.role === "user")
          .map((m) => m.text.trim())
          .join("\n\n");
        if (!cancelled) setFormattedNote(raw);
      }
      if (!cancelled) review();
    })();

    return () => {
      cancelled = true;
    };
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = useCallback(
    (note: string, msgs: TranscriptMessage[]) => {
      setConfirmedNote(note);
      setConfirmedMessages(msgs);
      confirm();
    },
    [confirm]
  );

  if (showWelcome) {
    return <WelcomeScreen onBegin={() => setShowWelcome(false)} />;
  }

  if (status === "formatting") {
    return <FormattingScreen />;
  }

  if (status === "ended") {
    return (
      <SessionEnded
        formattedNote={confirmedNote}
        messages={confirmedMessages}
        elapsedSeconds={elapsedSeconds}
      />
    );
  }

  return (
    <SessionShell
      isActive={status === "active"}
      isConnecting={status === "connecting"}
      isReview={status === "review"}
      voiceActivity={voiceActivity}
      messages={messages}
      aiPartial={aiPartial}
      formattedNote={formattedNote}
      elapsedSeconds={elapsedSeconds}
      error={error}
      onStart={start}
      onStop={stop}
      onConfirm={handleConfirm}
    />
  );
}
