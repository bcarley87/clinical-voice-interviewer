"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Mic, PhoneOff, RotateCcw, Download, Copy, Check, RefreshCw } from "lucide-react";
import {
  useRealtimeSession,
  type VoiceActivity,
  type TranscriptMessage,
} from "@/hooks/useRealtimeSession";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const VOICE_CONFIGS: Record<
  VoiceActivity,
  { label: string; pulse: boolean; dim: boolean }
> = {
  listening: { label: "Listening", pulse: false, dim: true },
  user_speaking: { label: "You are speaking", pulse: true, dim: false },
  ai_speaking: { label: "AI is speaking", pulse: true, dim: true },
  processing: { label: "Processing…", pulse: true, dim: true },
};

function VoiceIndicator({ activity }: { activity: VoiceActivity }) {
  const cfg = VOICE_CONFIGS[activity];
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        cfg.dim ? "text-muted-foreground" : "text-primary"
      }`}
    >
      <span
        aria-hidden
        className={`w-1.5 h-1.5 rounded-full bg-current ${
          cfg.pulse ? "animate-pulse" : ""
        }`}
      />
      {cfg.label}
    </div>
  );
}

type GenerationState = "idle" | "loading" | "done" | "error";

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

function SessionEnded({
  messages,
  elapsedSeconds,
}: {
  messages: TranscriptMessage[];
  elapsedSeconds: number;
}) {
  const [profileState, setProfileState] = useState<GenerationState>("loading");
  const [compressState, setCompressState] = useState<GenerationState>("idle");
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
      {/* Header */}
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

      {/* Tabs */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">

          {/* Tab 1 */}
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
                      onClick={() =>
                        downloadFile(
                          fullProfile,
                          `voice_profile_${timestamp}.md`
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {fullProfile}
                    </ReactMarkdown>
                  </div>
                </>
              )}
            </>
          )}

          {/* Tab 2 */}
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
                      onClick={() =>
                        downloadFile(
                          compressedProfile,
                          `about_me_${timestamp}.md`
                        )
                      }
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
    sendText,
  } = useRealtimeSession();

  const [showText, setShowText] = useState(false);
  const [textInput, setTextInput] = useState("");

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendText(textInput.trim());
    setTextInput("");
  };

  // ── Idle / Connecting ─────────────────────────────────────────────────────
  if (status === "idle" || status === "connecting") {
    return (
      <div className="flex flex-col h-dvh bg-background items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-8">
          <div>
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-5">
              <Mic className="w-7 h-7 text-muted-foreground" />
            </div>
            <h1 className="text-sm font-semibold text-foreground tracking-widest uppercase">
              Clinical Voice Interviewer
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Voice Profile Session
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Speak naturally — the AI will listen and respond by voice. You can
            interrupt at any time.
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive text-left">
              {error}
            </div>
          )}

          <button
            onClick={start}
            disabled={status === "connecting"}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-sm font-medium rounded-lg transition-colors"
          >
            {status === "connecting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Interview
              </>
            )}
          </button>

          <p className="text-xs text-muted-foreground opacity-50">
            Microphone access required
          </p>
        </div>
      </div>
    );
  }

  // ── Session ended ─────────────────────────────────────────────────────────
  if (status === "ended") {
    return <SessionEnded messages={messages} elapsedSeconds={elapsedSeconds} />;
  }

  // ── Active session ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xs font-semibold text-foreground tracking-widest uppercase">
              Clinical Voice Interviewer
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Session in progress
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </header>

      <Conversation className="flex-1">
        <ConversationContent className="max-w-3xl mx-auto w-full px-4">
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                <MessageResponse>{m.text}</MessageResponse>
              </MessageContent>
            </Message>
          ))}

          {/* Streaming AI partial — shown while AI is speaking */}
          {aiPartial && (
            <Message from="assistant">
              <MessageContent>
                <MessageResponse>{aiPartial}</MessageResponse>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t border-border px-4 py-3 bg-card">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <VoiceIndicator activity={voiceActivity} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowText((v) => !v)}
                title="Type instead of speaking"
                className={`p-1.5 rounded transition-colors ${
                  showText
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={stop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-colors"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                End
              </button>
            </div>
          </div>

          {/* Text fallback — shown when microphone isn't working */}
          {showText && (
            <form onSubmit={submitText} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a message instead of speaking…"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="px-3 py-2 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground text-sm font-medium rounded-lg transition-colors"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
