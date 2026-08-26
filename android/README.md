# One Post AI — Android (Capacitor) Build Guide

This folder holds the **assets and configuration** for the One Post AI native
Android shell. It wraps the hosted web app (`https://onepostai.vercel.app`) in a
WebView — the app is a cloud SaaS, so it loads the live site rather than bundled
offline assets.

## What's already here
- `capacitor.config.ts` (repo root) — app id `com.aurahaventech.onepostai`,
  WebView pointed at the hosted app, brand colors.
- `www/index.html` (repo root) — minimal loader/fallback page (webDir).
- `app/src/main/res/` — complete launcher icon set (mipmap-* densities), adaptive
  icons (API 26+), monochrome, and splash, in brand dark gray + champagne gold.

## Steps to scaffold + build the project (run on a machine with Android SDK + Java)

The `cap add android` command generates the full Gradle Android project from the
Capacitor Android template. It must be run after `npm install`:

```bash
cd /home/team/shared/onepostai
npm install            # installs @capacitor/core, @capacitor/cli, @capacitor/android
npx cap add android    # generates ./android Gradle project (keeps existing res/)
npx cap sync android   # copies web assets + config into the android project
```

> The `app/src/main/res/` assets in this repo are already in place; `cap add
> android` will not overwrite them. `npx cap sync` only copies `www/` + config.

Then build the debug APK:
```bash
cd android
./gradlew assembleDebug      # APK at app/build/outputs/apk/debug/
./gradlew bundleRelease      # AAB (release) for Play Store if signed
```

## App signing (keystore) — REQUIRED for the Play Store
You cannot update a Play Store app without its keystore; keep it safe forever.
Generate it once and store the password securely (password manager + offline):

```bash
keytool -genkeypair -v \
  -keystore onepostai-release.keystore \
  -alias onepostai \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass '<STRONG_PASSWORD>' -keypass '<STRONG_PASSWORD>' \
  -dname "CN=One Post AI,O=Aura Haven Tech,L=City,ST=State,C=US"
```

Configure Android Studio or add to `android/app/build.gradle` a `release`
`signingConfig` pointing at this keystore, then `./gradlew bundleRelease`.

## Play Console submission (after signed AAB exists)
1. Apps → Create app → name "One Post AI", package name `com.aurahaventech.onepostai`.
2. Upload the signed `.aab` to **Internal testing** → roll to **Production**.
3. Complete the **Data safety** form, **content rating**, and app listing
   (description + screenshots + feature graphic 1024×500).

## What the owner must supply
- Android keystore password custody (or approve the one generated here).
- Play Console access (add team account) so we can upload.
- App store screenshots + feature graphic, or approve us generating them.
- Public Privacy Policy URL (required by the store).
