import { Capacitor } from '@capacitor/core';
import type { Haptics as HapticsType } from '@capacitor/haptics';

let HapticsPlugin: typeof HapticsType | null = null;

async function getHaptics() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!HapticsPlugin) {
    const mod = await import('@capacitor/haptics');
    HapticsPlugin = mod.Haptics;
  }
  return HapticsPlugin;
}

export function useHaptics() {
  /** Light tap — confirm a quick decision (mulligan, perk, compound choice) */
  const confirmTap = async () => {
    const h = await getHaptics();
    if (!h) return;
    const { ImpactStyle } = await import('@capacitor/haptics');
    await h.impact({ style: ImpactStyle.Light });
  };

  /** Medium tap — play a card */
  const playCardTap = async () => {
    const h = await getHaptics();
    if (!h) return;
    const { ImpactStyle } = await import('@capacitor/haptics');
    await h.impact({ style: ImpactStyle.Medium });
  };

  /** Success notification — debrief / race complete */
  const successBuzz = async () => {
    const h = await getHaptics();
    if (!h) return;
    const { NotificationType } = await import('@capacitor/haptics');
    await h.notification({ type: NotificationType.Success });
  };

  return { confirmTap, playCardTap, successBuzz };
}
