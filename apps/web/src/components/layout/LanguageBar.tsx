import { useState } from 'react';
import { useI18n } from '../../i18n';
import { useAudio } from '../../hooks/use-audio';

export function LanguageBar() {
  const { locale, setLocale } = useI18n();
  const audio = useAudio();
  const [muted, setMuted] = useState(() => audio.isMuted());

  return (
    <div className="safe-area-pt sticky top-0 z-50 bg-carbon/80 backdrop-blur-xl pt-1">
      <div className="mx-auto flex max-w-xl items-center justify-end gap-2 px-5 py-2">
        <div className="flex items-center gap-1 rounded-full bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`rounded-full px-3 py-1 text-sm transition-all duration-150 ${
              locale === 'en'
                ? 'bg-white/12 text-white'
                : 'text-metal-light hover:text-white'
            }`}
            aria-label="English"
          >
            <span aria-hidden="true">🇺🇸</span>
          </button>
          <button
            type="button"
            onClick={() => setLocale('pt-BR')}
            className={`rounded-full px-3 py-1 text-sm transition-all duration-150 ${
              locale === 'pt-BR'
                ? 'bg-white/12 text-white'
                : 'text-metal-light hover:text-white'
            }`}
            aria-label="Portugues"
          >
            <span aria-hidden="true">🇧🇷</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMuted(audio.toggleMute())}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/50 transition-colors hover:bg-white/15 hover:text-white"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
