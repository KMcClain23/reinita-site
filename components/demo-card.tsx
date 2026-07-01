"use client";

import { useRef, useState, useEffect } from "react";

export interface Demo {
  id: string;
  title: string;
  genre: string;
  character: string;
  description: string;
  audio_url: string;
  duration_seconds?: number;
}

interface DemoCardProps {
  demo: Demo;
  variant?: "light" | "dark";
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function DemoCard({ demo, variant = "light" }: DemoCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(demo.duration_seconds ?? 0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    // Track playing state via the actual audio events, not just the toggle.
    // This lets an external pause (e.g., a sibling demo starting) correctly
    // update this card's UI.
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.play();
    }
    // No need to setPlaying — the play/pause event listeners handle it
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    a.currentTime = (x / rect.width) * duration;
  };

  const isDark = variant === "dark";
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <article
      className={`lift-card p-7 ${
        isDark
          ? "bg-abyss border border-mist/15"
          : "bg-shell border border-mist"
      } rounded-2xl`}
    >
      <p
        className={`eyebrow mb-3 ${isDark ? "text-mist" : ""}`}
      >
        {demo.genre}
      </p>
      <h3
        className={`font-display-italic text-3xl leading-tight mb-1 ${
          isDark ? "text-shore" : "text-abyss"
        }`}
      >
        {demo.title}
      </h3>
      <p
        className={`text-sm mb-5 ${isDark ? "text-mist/70" : "text-driftwood"}`}
      >
        {demo.character}
      </p>
      <p
        className={`text-sm leading-relaxed mb-6 ${
          isDark ? "text-mist/85" : "text-ink-soft"
        }`}
      >
        {demo.description}
      </p>

      {/* Player */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className={`shrink-0 size-11 rounded-full flex items-center justify-center transition-colors ${
            isDark
              ? "bg-shore text-abyss hover:bg-mist"
              : "bg-abyss text-shore hover:bg-tide"
          } ${playing ? "is-playing" : ""}`}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="2" width="3.5" height="10" rx="1" />
              <rect x="8.5" y="2" width="3.5" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5 L12 7 L3 12.5 Z" />
            </svg>
          )}
        </button>

        <div
          className="flex-1 cursor-pointer group"
          onClick={seek}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div
            className={`h-[2px] w-full ${
              isDark ? "bg-mist/20" : "bg-mist"
            } relative overflow-hidden group-hover:h-[3px] transition-[height]`}
          >
            <div
              className={`absolute top-0 left-0 h-full ${
                isDark ? "bg-mist" : "bg-tide"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <span
          className={`text-xs tabular-nums shrink-0 ${
            isDark ? "text-mist/60" : "text-driftwood"
          }`}
        >
          {fmtTime(progress)} / {fmtTime(duration)}
        </span>
      </div>

      <audio ref={audioRef} preload="metadata" src={demo.audio_url} />
    </article>
  );
}
