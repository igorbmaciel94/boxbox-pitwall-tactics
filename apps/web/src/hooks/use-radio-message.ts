import { useCallback, useRef } from 'react';
import { useGameStore } from '../stores/game-store';
import { useUIStore } from '../stores/ui-store';
import { useAudio } from './use-audio';
import type { EventType } from '@apex/engine';
import type { RadioContext } from '../i18n';

export function useRadioMessage() {
  const catalog = useGameStore((s) => s.catalog);
  const addRadioMessage = useUIStore((s) => s.addRadioMessage);
  const { playRadioMessage } = useAudio();
  const hasPlayedSound = useRef(false);

  const sendRadio = useCallback(
    (context: RadioContext) => {
      if (!catalog) return;
      const pool = catalog.strings.radio[context];
      if (!pool || pool.length === 0) return;
      const flavorIndex = Math.floor(Math.random() * pool.length);
      addRadioMessage({ source: 'radio', key: context, flavorIndex });
    },
    [catalog, addRadioMessage],
  );

  const sendEventRadio = useCallback(
    (eventType: EventType) => {
      if (!catalog) return;
      const pool = catalog.strings.events[eventType];
      if (!pool || pool.length === 0) return;
      const flavorIndex = Math.floor(Math.random() * pool.length);
      addRadioMessage({ source: 'event', key: eventType, flavorIndex });
      if (!hasPlayedSound.current) {
        playRadioMessage();
        hasPlayedSound.current = true;
      }
    },
    [catalog, addRadioMessage, playRadioMessage],
  );

  return { sendRadio, sendEventRadio };
}
