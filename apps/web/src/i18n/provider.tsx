import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { EventType } from '@boxbox/engine';
import { DEFAULT_LOCALE, DICTIONARIES } from './translations';
import type { Dictionary, Locale, Medal, RadioContext } from './translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
  t: (key: string, vars?: Record<string, string | number>) => string;
  getCardName: (cardId: string, fallback?: string) => string;
  getCardRulesText: (cardId: string, fallback?: string) => string;
  getTeamName: (teamId: string, fallback?: string) => string;
  getPerkName: (perkId: string, fallback?: string) => string;
  getPerkDescription: (perkId: string, fallback?: string) => string;
  getScenarioName: (scenarioId: string, fallback?: string) => string;
  getScenarioCircuit: (scenarioId: string, fallback?: string) => string;
  getObjectiveDescription: (objectiveId: string, fallback?: string) => string;
  getEventName: (eventType: EventType, fallback?: string) => string;
  getEventFlavor: (eventType: EventType, flavorIndex: number, fallback?: string) => string;
  getRadioMessage: (context: RadioContext, flavorIndex: number, fallback?: string) => string;
  getCardPros: (cardId: string) => string[];
  getCardCons: (cardId: string) => string[];
  getTagLabel: (tag: string, fallback?: string) => string;
  getFilterLabel: (filterKey: 'all' | 'drive' | 'pit' | 'tactics', fallback?: string) => string;
  getMedalLabel: (medal: Medal, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getPathValue(target: unknown, key: string): unknown {
  const parts = key.split('.');
  let current = target;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/{{\s*([^\s{}]+)\s*}}/g, (_, key: string) => {
    const value = vars[key];
    return value === undefined ? '' : String(value);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  const dictionary = DICTIONARIES[locale];

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getPathValue(dictionary.ui, key);
      if (typeof value !== 'string') {
        return key;
      }
      return interpolate(value, vars);
    },
    [dictionary],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      dictionary,
      t,
      getCardName: (cardId, fallback = cardId) => dictionary.content.cards[cardId]?.name ?? fallback,
      getCardRulesText: (cardId, fallback = '') => dictionary.content.cards[cardId]?.rulesText ?? fallback,
      getCardPros: (cardId) => dictionary.content.cards[cardId]?.pros ?? [],
      getCardCons: (cardId) => dictionary.content.cards[cardId]?.cons ?? [],
      getTeamName: (teamId, fallback = teamId) => dictionary.content.teams[teamId]?.name ?? fallback,
      getPerkName: (perkId, fallback = perkId) => dictionary.content.perks[perkId]?.name ?? fallback,
      getPerkDescription: (perkId, fallback = '') => dictionary.content.perks[perkId]?.description ?? fallback,
      getScenarioName: (scenarioId, fallback = scenarioId) => dictionary.content.scenarios[scenarioId]?.name ?? fallback,
      getScenarioCircuit: (scenarioId, fallback = '') => dictionary.content.scenarios[scenarioId]?.circuit ?? fallback,
      getObjectiveDescription: (objectiveId, fallback = objectiveId) => dictionary.content.objectives[objectiveId] ?? fallback,
      getEventName: (eventType, fallback = eventType) => dictionary.content.events.names[eventType] ?? fallback,
      getEventFlavor: (eventType, flavorIndex, fallback = '') => {
        const entries = dictionary.content.events.flavors[eventType];
        if (!entries || entries.length === 0) return fallback;
        return entries[flavorIndex] ?? fallback ?? entries[0];
      },
      getRadioMessage: (context, flavorIndex, fallback = '') => {
        const entries = dictionary.content.radio[context];
        if (!entries || entries.length === 0) return fallback;
        return entries[flavorIndex] ?? fallback ?? entries[0];
      },
      getTagLabel: (tag, fallback = tag) => dictionary.content.tags[tag] ?? fallback,
      getFilterLabel: (filterKey, fallback = filterKey) => dictionary.content.filters[filterKey] ?? fallback,
      getMedalLabel: (medal, fallback = medal) => dictionary.content.medals[medal] ?? fallback,
    }),
    [dictionary, locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
