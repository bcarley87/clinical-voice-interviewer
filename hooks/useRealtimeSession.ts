"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type SessionStatus = "idle" | "connecting" | "active" | "ended";
export type VoiceActivity =
  | "listening"
  | "user_speaking"
  | "ai_speaking"
  | "processing";

interface RealtimeEvent {
  type: string;
  [key: string]: unknown;
}

export function useRealtimeSession() {
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [aiPartial, setAiPartial] = useState("");
  const [voiceActivity, setVoiceActivity] = useState<VoiceActivity>("listening");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  // Track partial AI text in a ref to read synchronously in event handlers
  const aiPartialRef = useRef("");

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => s.track?.stop());
      pcRef.current.close();
      pcRef.current = null;
    }
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
      audioElRef.current = null;
    }
    aiPartialRef.current = "";
  }, []);

  const handleEvent = useCallback((event: RealtimeEvent) => {
    switch (event.type) {
      case "response.audio_transcript.delta": {
        const delta = ((event as unknown) as { delta: string }).delta ?? "";
        aiPartialRef.current += delta;
        setAiPartial(aiPartialRef.current);
        setVoiceActivity("ai_speaking");
        break;
      }

      case "response.audio_transcript.done": {
        const transcript = ((event as unknown) as { transcript: string }).transcript ?? "";
        if (transcript.trim()) {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "assistant", text: transcript },
          ]);
        }
        aiPartialRef.current = "";
        setAiPartial("");
        break;
      }

      case "response.done": {
        // Catch responses interrupted before audio_transcript.done fires
        if (aiPartialRef.current.trim()) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: aiPartialRef.current,
            },
          ]);
          aiPartialRef.current = "";
          setAiPartial("");
        }
        setVoiceActivity((prev) =>
          prev !== "user_speaking" ? "listening" : prev
        );
        break;
      }

      case "conversation.item.input_audio_transcription.completed": {
        const transcript = ((event as unknown) as { transcript: string }).transcript ?? "";
        if (transcript.trim()) {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "user", text: transcript },
          ]);
        }
        break;
      }

      case "input_audio_buffer.speech_started":
        setVoiceActivity("user_speaking");
        break;

      case "input_audio_buffer.speech_stopped":
        setVoiceActivity((prev) =>
          prev === "user_speaking" ? "processing" : prev
        );
        break;

      case "error": {
        const msg = (event as { error?: { message?: string } }).error?.message;
        console.error("Realtime API error:", msg);
        setError(msg ?? "Unknown error from Realtime API");
        break;
      }
    }
  }, []);

  const start = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    setMessages([]);
    setAiPartial("");
    setVoiceActivity("listening");
    setElapsedSeconds(0);
    aiPartialRef.current = "";

    try {
      // Fetch ephemeral token from our backend
      const res = await fetch("/api/realtime-session");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `Session endpoint returned ${res.status}`);
      }
      const { clientSecret } = (await res.json()) as { clientSecret: string };

      // Audio element to play the AI's voice
      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioElRef.current = audioEl;

      // WebRTC peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        // Only act on unintentional failures; intentional stop() sets pcRef to null
        // before this fires, so skip if we already cleaned up.
        if (pcRef.current === null) return;
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          setError("WebRTC connection lost");
          setStatus("ended");
          cleanup();
        }
      };

      // Add microphone track
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
      }

      // Data channel for Realtime API events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        setStatus("active");
        startTimeRef.current = Date.now();
        // Prompt the AI to begin (speaks the vignette as its first turn)
        dc.send(JSON.stringify({ type: "response.create" }));
      };

      dc.onmessage = (e) => {
        try {
          handleEvent(JSON.parse(e.data as string) as RealtimeEvent);
        } catch {
          // Ignore malformed events
        }
      };

      dc.onerror = () => {
        setError("Data channel error — connection lost");
        setStatus("ended");
        cleanup();
      };

      // SDP offer → OpenAI → SDP answer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            "Content-Type": "application/sdp",
          },
        }
      );

      if (!sdpRes.ok) {
        throw new Error(
          `Realtime API: ${sdpRes.status} — ${await sdpRes.text()}`
        );
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start session";
      setError(message);
      setStatus("idle");
      cleanup();
    }
  }, [cleanup, handleEvent]);

  const stop = useCallback(() => {
    cleanup();
    setStatus("ended");
  }, [cleanup]);

  const sendText = useCallback((text: string) => {
    if (!dcRef.current || dcRef.current.readyState !== "open") return;
    dcRef.current.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      })
    );
    dcRef.current.send(JSON.stringify({ type: "response.create" }));
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text },
    ]);
  }, []);

  // Elapsed timer — runs only while active
  useEffect(() => {
    if (status !== "active") return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  return {
    status,
    messages,
    aiPartial,
    voiceActivity,
    elapsedSeconds,
    error,
    start,
    stop,
    sendText,
  };
}
