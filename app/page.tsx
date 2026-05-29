"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Download, Copy, Check, RefreshCw, ArrowRight } from "lucide-react";
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

function SessionReview({
  messages,
  elapsedSeconds,
  onConfirm,
}: {
  messages: TranscriptMessage[];
  elapsedSeconds: number;
  onConfirm: (edited: TranscriptMessage[]) => void;
}) {
  const [edited, setEdited] = useState<TranscriptMessage[]>(messages);

  const updateText = (id: string, text: string) =>
    setEdited((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));

  const userCount = edited.filter((m) => m.role === "user").length;

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xs font-semibold text-foreground tracking-widest uppercase">
              Review your session
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Edit anything before generating your profile · {userCount} response{userCount !== 1 ? "s" : ""} · {formatTime(elapsedSeconds)}
            </p>
          </div>
          <button
            onClick={() => onConfirm(edited)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Generate my profile
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-4">
          {edited.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No transcript recorded.</p>
          )}
          {edited.map((m) =>
            m.role === "assistant" ? (
              <div key={m.id} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{m.text}</p>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-medium text-muted-foreground">
                  You
                </div>
                <textarea
                  value={m.text}
                  onChange={(e) => updateText(m.id, e.target.value)}
                  rows={Math.max(2, Math.ceil(m.text.length / 80))}
                  className="flex-1 text-sm text-foreground leading-relaxed bg-card border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function SessionEnded({
  messages,
  elapsedSeconds,
}: {
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
          body: JSON.stringify({ messages }),
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
    voiceActivity,
    elapsedSeconds,
    error,
    start,
    stop,
    confirm,
  } = useRealtimeSession();

  const [confirmedMessages, setConfirmedMessages] = useState<TranscriptMessage[]>([]);

  const handleConfirm = useCallback((edited: TranscriptMessage[]) => {
    setConfirmedMessages(edited);
    confirm();
  }, [confirm]);

  if (status === "review") {
    return (
      <SessionReview
        messages={messages}
        elapsedSeconds={elapsedSeconds}
        onConfirm={handleConfirm}
      />
    );
  }

  if (status === "ended") {
    return <SessionEnded messages={confirmedMessages} elapsedSeconds={elapsedSeconds} />;
  }

  return (
    <SessionShell
      isActive={status === "active"}
      isConnecting={status === "connecting"}
      voiceActivity={voiceActivity}
      messages={messages}
      elapsedSeconds={elapsedSeconds}
      error={error}
      onStart={start}
      onStop={stop}
    />
  );
}
