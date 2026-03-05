import { useCallback, useEffect, useRef } from 'react';

const AUDIO_FILES = {
  radioStatic: '/audio/radio-static.mp3',
  pitStop: '/audio/pit-stop.mp3',
} as const;

const MUSIC_FILES = {
  menu: '/audio/menu-theme.mp3',
  race: '/audio/race-theme.mp3',
} as const;

type MusicTrack = keyof typeof MUSIC_FILES;

let globalMuted = localStorage.getItem('boxbox-muted') === 'true';

// Preloaded audio elements (shared across hook instances)
const audioCache: Record<string, HTMLAudioElement> = {};
const musicCache: Record<string, HTMLAudioElement> = {};
let currentMusicTrack: MusicTrack | null = null;
let currentMusicAudio: HTMLAudioElement | null = null;
let desiredMusicTrack: MusicTrack | null = null;
let unlockListenerBound = false;

function bindAudioUnlockListener() {
  if (typeof window === 'undefined' || unlockListenerBound) return;
  unlockListenerBound = true;

  const unlock = () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    unlockListenerBound = false;
    if (!globalMuted && desiredMusicTrack) {
      syncMusicPlayback(desiredMusicTrack);
    }
  };

  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

function getMusic(src: string): HTMLAudioElement | null {
  try {
    if (!musicCache[src]) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.loop = true;
      musicCache[src] = audio;
    }
    return musicCache[src];
  } catch {
    return null;
  }
}

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

function stopMusicPlayback(resetTime = false) {
  if (!currentMusicAudio) return;
  currentMusicAudio.pause();
  if (resetTime) {
    currentMusicAudio.currentTime = 0;
  }
}

function syncMusicPlayback(track: MusicTrack | null) {
  desiredMusicTrack = track;

  if (track === null || globalMuted) {
    currentMusicTrack = null;
    stopMusicPlayback(false);
    return;
  }

  if (currentMusicTrack === track && currentMusicAudio && !currentMusicAudio.paused) {
    return;
  }

  const src = MUSIC_FILES[track];
  const audio = getMusic(src);
  if (!audio) return;

  if (currentMusicAudio && currentMusicAudio !== audio) {
    stopMusicPlayback(true);
  }

  currentMusicTrack = track;
  currentMusicAudio = audio;
  currentMusicAudio.volume = track === 'race' ? 0.22 : 0.18;
  currentMusicAudio.play().catch(() => {
    // Autoplay blocked until first user interaction.
    bindAudioUnlockListener();
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
    for (const src of Object.values(MUSIC_FILES)) {
      getMusic(src);
    }
    bindAudioUnlockListener();
  }, []);

  const playRadioMessage = useCallback(() => {
    playSound(AUDIO_FILES.radioStatic, 0.4);
  }, []);

  const setBackgroundTrack = useCallback((track: MusicTrack | null) => {
    syncMusicPlayback(track);
  }, []);

  return {
    playCardSelect: () => {},
    playCardPlay: () => {},
    playPitStop: () => {
      playSound(AUDIO_FILES.pitStop, 0.5);
    },
    playEventReveal: () => {},
    playSafetyCar: () => {},
    playRainStart: () => {},
    playRadioMessage,
    playTurnComplete: () => {},
    playRaceComplete: () => {},
    setBackgroundTrack,
    isMuted: () => globalMuted,
    toggleMute: () => {
      globalMuted = !globalMuted;
      localStorage.setItem('boxbox-muted', String(globalMuted));
      if (globalMuted) {
        currentMusicTrack = null;
        stopMusicPlayback(false);
      } else {
        syncMusicPlayback(desiredMusicTrack);
      }
      return globalMuted;
    },
  };
}
