import { useCallback, useRef } from 'react';
import { useGameStore } from '../stores/game-store';
import { useUIStore } from '../stores/ui-store';
import { useAudio } from './use-audio';

export function useRadioMessage() {
  const catalog = useGameStore((s) => s.catalog);
  const addRadioMessage = useUIStore((s) => s.addRadioMessage);
  const { playRadioMessage } = useAudio();
  const hasPlayedSound = useRef(false);

  const sendRadio = useCallback(
    (context: 'stayOut' | 'boxBox' | 'generic') => {
      if (!catalog) return;
      const pool = catalog.strings.radio[context];
      if (!pool || pool.length === 0) return;
      const msg = pool[Math.floor(Math.random() * pool.length)];
      addRadioMessage(msg);
    },
    [catalog, addRadioMessage],
  );

  const sendEventRadio = useCallback(
    (eventType: string) => {
      if (!catalog) return;
      const pool = catalog.strings.events[eventType as keyof typeof catalog.strings.events];
      if (!pool || pool.length === 0) return;
      const msg = pool[Math.floor(Math.random() * pool.length)];
      addRadioMessage(msg);
      if (!hasPlayedSound.current) {
        playRadioMessage();
        hasPlayedSound.current = true;
      }
    },
    [catalog, addRadioMessage, playRadioMessage],
  );

  return { sendRadio, sendEventRadio };
}
