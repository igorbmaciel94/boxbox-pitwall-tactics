import { useCallback, useEffect, useRef } from 'react';

const AUDIO_FILES = {
  radioStatic: '/audio/radio-static.mp3',
} as const;

let globalMuted = localStorage.getItem('boxbox-muted') === 'true';

// Preloaded audio elements (shared across hook instances)
const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(src: string): HTMLAudioElement | null {
  try {
    if (!audioCache[src]) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audioCache[src] = audio;
    }
    return audioCache[src];
  } catch {
    return null;
  }
}

function playSound(src: string, volume = 0.5) {
  if (globalMuted) return;
  const audio = getAudio(src);
  if (!audio) return;

  // Clone for overlapping playback
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = Math.max(0, Math.min(1, volume));
  clone.play().catch(() => {
    // Autoplay blocked — ignore silently
  });
}

export function useAudio() {
  // Preload audio files on mount
  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    for (const src of Object.values(AUDIO_FILES)) {
      getAudio(src);
    }
  }, []);

  const playRadioMessage = useCallback(() => {
    playSound(AUDIO_FILES.radioStatic, 0.4);
  }, []);

  return {
    playCardSelect: () => {},
    playCardPlay: () => {},
    playEventReveal: () => {},
    playSafetyCar: () => {},
    playRainStart: () => {},
    playRadioMessage,
    playTurnComplete: () => {},
    playRaceComplete: () => {},
    isMuted: () => globalMuted,
    toggleMute: () => {
      globalMuted = !globalMuted;
      localStorage.setItem('boxbox-muted', String(globalMuted));
      return globalMuted;
    },
  };
}
