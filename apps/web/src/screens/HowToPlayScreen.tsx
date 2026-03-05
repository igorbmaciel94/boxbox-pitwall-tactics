import { useNavigate } from 'react-router';
import type { ReactNode } from 'react';
import { useI18n } from '../i18n';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
      <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide text-white">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-white/75">{children}</div>
    </div>
  );
}

function Term({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-20 shrink-0 font-display text-xs font-bold uppercase tracking-wider text-hud-cyan">{label}</span>
      <span className="text-sm text-metal-light">{children}</span>
    </div>
  );
}

export function HowToPlayScreen() {
  const navigate = useNavigate();
  const { t, getTagLabel } = useI18n();

  return (
    <div className="flex flex-col px-5 pb-8 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-left text-xs uppercase tracking-wider text-metal-light transition-colors hover:text-white"
      >
        &larr; {t('common.back')}
      </button>

      <h1 className="mb-1 font-display text-2xl font-black uppercase tracking-wide">{t('howToPlay.title')}</h1>
      <p className="mb-6 text-sm text-metal-light">{t('howToPlay.subtitle')}</p>

      <Section title={t('howToPlay.sections.overviewTitle')}>
        <p>{t('howToPlay.sections.overviewP1')}</p>
        <p>{t('howToPlay.sections.overviewP2')}</p>
      </Section>

      <Section title={t('howToPlay.sections.gettingStartedTitle')}>
        <p>{t('howToPlay.sections.start1')}</p>
        <p>{t('howToPlay.sections.start2')}</p>
        <p>{t('howToPlay.sections.start3')}</p>
      </Section>

      <Section title={t('howToPlay.sections.raceFlowTitle')}>
        <div className="space-y-2 rounded-xl bg-white/[0.04] p-3">
          <Term label={t('howToPlay.sections.eventLabel')}>{t('howToPlay.sections.eventText')}</Term>
          <Term label={t('howToPlay.sections.perkLabel')}>{t('howToPlay.sections.perkText')}</Term>
          <Term label={t('howToPlay.sections.playLabel')}>{t('howToPlay.sections.playText')}</Term>
          <Term label={t('howToPlay.sections.resultLabel')}>{t('howToPlay.sections.resultText')}</Term>
        </div>
      </Section>

      <Section title={t('howToPlay.sections.cardTypesTitle')}>
        <div className="space-y-2">
          <div className="rounded-xl bg-hud-green/5 border border-hud-green/15 p-3">
            <span className="font-display text-xs font-bold uppercase text-hud-green">{getTagLabel('aggressive', 'Drive')}</span>
            <span className="ml-2 text-sm text-metal-light">{t('howToPlay.sections.drive')}</span>
          </div>
          <div className="rounded-xl bg-hud-amber/5 border border-hud-amber/15 p-3">
            <span className="font-display text-xs font-bold uppercase text-hud-amber">{getTagLabel('pit', 'Pit')}</span>
            <span className="ml-2 text-sm text-metal-light">{t('howToPlay.sections.pit')}</span>
          </div>
          <div className="rounded-xl bg-f1-red/5 border border-f1-red/15 p-3">
            <span className="font-display text-xs font-bold uppercase text-f1-red">{getTagLabel('defensive', 'Tactics')}</span>
            <span className="ml-2 text-sm text-metal-light">{t('howToPlay.sections.tactics')}</span>
          </div>
        </div>
      </Section>

      <Section title={t('howToPlay.sections.hudTitle')}>
        <div className="space-y-2 rounded-xl bg-white/[0.04] p-3">
          <Term label={t('stats.pos')}>{t('howToPlay.sections.pos')}</Term>
          <Term label={t('stats.wear')}>{t('howToPlay.sections.wear')}</Term>
        </div>
      </Section>

      <Section title={t('howToPlay.sections.tireStrategyTitle')}>
        <p>{t('howToPlay.sections.tireP1')}</p>
        <div className="space-y-2 rounded-xl bg-white/[0.04] p-3">
          <Term label="S / M / H">{t('howToPlay.sections.tireCompounds')}</Term>
          <Term label="PIT">{t('howToPlay.sections.tirePitStop')}</Term>
          <Term label="100%">{t('howToPlay.sections.tireBlowout')}</Term>
          <Term label="SZN">{t('howToPlay.sections.tireSeasonBudget')}</Term>
        </div>
      </Section>

      <Section title={t('howToPlay.sections.mulliganTitle')}>
        <p>{t('howToPlay.sections.mulliganText')}</p>
      </Section>

      <Section title={t('howToPlay.sections.safetyCarTitle')}>
        <p>{t('howToPlay.sections.safetyCarText')}</p>
      </Section>

      <Section title={t('howToPlay.sections.skipTurnTitle')}>
        <p>{t('howToPlay.sections.skipTurnText')}</p>
      </Section>

      <Section title={t('howToPlay.sections.crashTitle')}>
        <p>{t('howToPlay.sections.crashText')}</p>
      </Section>

      <Section title={t('howToPlay.sections.bwFlagTitle')}>
        <p>{t('howToPlay.sections.bwFlagText')}</p>
      </Section>

      <Section title={t('howToPlay.sections.eventsTitle')}>
        <div className="space-y-2 rounded-xl bg-white/[0.04] p-3">
          <Term label="SC">{t('howToPlay.sections.sc')}</Term>
          <Term label={'\u{1F327}\u{FE0F}'}>{t('howToPlay.sections.rainEvent')}</Term>
          <Term label="ETC">{t('howToPlay.sections.others')}</Term>
        </div>
      </Section>

      <Section title={t('howToPlay.sections.scoringTitle')}>
        <div className="space-y-2 rounded-xl bg-white/[0.04] p-3">
          <Term label="FIN">{t('howToPlay.sections.finish')}</Term>
          <Term label="MAIN">{t('howToPlay.sections.main')}</Term>
          <Term label="BONUS">{t('howToPlay.sections.bonus')}</Term>
        </div>
      </Section>

      <Section title={t('howToPlay.sections.tipsTitle')}>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-metal-light">
          <li>{t('howToPlay.sections.tip1')}</li>
          <li>{t('howToPlay.sections.tip2')}</li>
          <li>{t('howToPlay.sections.tip3')}</li>
          <li>{t('howToPlay.sections.tip4')}</li>
          <li>{t('howToPlay.sections.tip5')}</li>
          <li>{t('howToPlay.sections.tip6')}</li>
        </ul>
      </Section>

      <button
        onClick={() => navigate('/')}
        className="mt-2 w-full rounded-2xl bg-white/[0.06] p-4 text-center font-display text-base font-semibold uppercase tracking-wide transition-colors hover:bg-white/10 active:scale-[0.98]"
      >
        {t('howToPlay.backToMenu')}
      </button>
    </div>
  );
}
