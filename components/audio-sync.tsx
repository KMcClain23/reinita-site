"use client";

import { useEffect } from "react";

/**
 * Ensures only one audio element plays at a time across the whole page.
 *
 * Mounts a document-level "play" listener in capture phase (audio events
 * don't bubble, so we can't use the standard bubbling phase). When any
 * audio starts, we pause all others. DemoCard listens to its own audio's
 * pause event, so its UI updates automatically when this fires.
 *
 * Also handles native <audio controls> elements — the admin's demo list
 * uses those, and they get the same behavior for free.
 */
export function AudioSync() {
  useEffect(() => {
    const onPlay = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      if (!(target instanceof HTMLAudioElement)) return;
      document.querySelectorAll("audio").forEach((a) => {
        if (a !== target && !a.paused) a.pause();
      });
    };
    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, []);

  return null;
}
