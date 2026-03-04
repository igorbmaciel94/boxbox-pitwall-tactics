import { useI18n } from '../../i18n';

export function LanguageBar() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="safe-area-pt sticky top-0 z-50 bg-carbon/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl items-center justify-end px-5 py-2">
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
      </div>
    </div>
  );
}
