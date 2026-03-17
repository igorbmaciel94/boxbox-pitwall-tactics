import { Capacitor } from '@capacitor/core';

export async function hideSplashScreen() {
  if (!Capacitor.isNativePlatform()) return;
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide();
}

export async function configureStatusBar() {
  if (!Capacitor.isNativePlatform()) return;
  const { StatusBar, Style } = await import('@capacitor/status-bar');
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#151d28' });
  await StatusBar.setOverlaysWebView({ overlay: false });
}
