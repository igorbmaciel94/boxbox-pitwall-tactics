# Mobile Builds (Capacitor)

Apex Tactics ships as a Capacitor app for iOS and Android.
The same React web app is bundled inside a native shell.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 20 |
| Xcode | >= 15 (macOS only, for iOS) |
| CocoaPods | latest (`sudo gem install cocoapods`) |
| Android Studio | latest (for Android) |
| JDK | >= 17 |

## First-time Setup

```bash
npm install                      # install all workspace deps
cd apps/web
npm run build                    # produce dist/
npx cap sync                     # copy web assets + sync native plugins
```

## iOS

```bash
cd apps/web
npm run cap:ios                  # build web → sync → open Xcode
```

In Xcode: select a simulator or connected device, then press **Run**.

## Android

```bash
cd apps/web
npm run cap:android              # build web → sync → open Android Studio
```

In Android Studio: select an emulator or device, then press **Run**.

## Root Convenience Scripts

From the repo root:

```bash
npm run cap:ios                  # same as above
npm run cap:android
```

## Live Reload (Development)

For faster iteration, run the Vite dev server and stream it to the device:

```bash
# Terminal 1 — start dev server
npm run dev:web

# Terminal 2 — run on device with live reload
cd apps/web
npx cap run ios --livereload --external
# or
npx cap run android --livereload --external
```

> The device must be on the same Wi-Fi network as your machine.

## Offline Data

The mobile app is fully offline. Player progress stays on the device and can be moved with the in-app backup export/import controls.

## App Icons & Splash Screen

Place source images in `apps/web/resources/`:

- `icon.png` — 1024x1024, no transparency
- `splash.png` — 2732x2732

Then generate all platform-specific assets:

```bash
cd apps/web
npx capacitor-assets generate --iconBackgroundColor '#151d28' --splashBackgroundColor '#151d28'
```

## Building an APK (Android)

```bash
cd apps/web
npm run build && npx cap sync android
cd android
./gradlew assembleDebug
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

- **CocoaPods on Apple Silicon**: if `pod install` fails, try `arch -x86_64 pod install`
- **Android SDK not found**: ensure `ANDROID_HOME` is set and `local.properties` points to your SDK
- **Fonts not loading offline**: Google Fonts are loaded via CDN; on a device without connectivity the app falls back to system fonts
