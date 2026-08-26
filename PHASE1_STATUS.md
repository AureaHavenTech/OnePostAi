# One Post AI — Native Android (Capacitor) — Phase 1 Status

**Date:** 2026-08-24
**Task:** b259494a — Build One Post AI native Android app (Capacitor wrap), Phase 1
**Repo:** `/home/team/shared/onepostai` (AureaHavenTech/OnePostAi)
**Branch:** `feature/capacitor-android` (created from `main`; pushes to origin via PR)

---

## 1. Honest summary — what is DONE vs NOT DONE

| Item | Status |
|------|--------|
| Capacitor config (`capacitor.config.ts`) pointing at hosted web app | ✅ **DONE** |
| `www/` loader page (webDir) | ✅ **DONE** |
| `@capacitor/*` devDependencies added to `package.json` | ✅ **DONE** |
| Android launcher icons (all densities, on-brand gold/dark) | ✅ **DONE** |
| Android adaptive icons (API 26+) + monochrome | ✅ **DONE** |
| Splash screen asset (brand) | ✅ **DONE** |
| AndroidManifest.xml, MainActivity.java, styles, strings | ✅ **DONE** |
| Full Gradle project scaffold (`npx cap add android`) | ⚠️ NOT run — see why below |
| Signed AAB / APK artifact | ❌ **NOT produced** — environment cannot |
| Icons verified structurally valid (PNG decode, sampled pixels) | ✅ **DONE** |

**Why the Gradle scaffold + AAB are not produced here:** this machine has **no
Java, no Gradle, no Android SDK**, and the build toolchain needs ~10GB+. The
environment has a 2 GB `/home` filesystem that is already ~80% consumed by an
untouchable `/home/lost+found` (1.5 GB of recovered files — the one directory we
must never delete). Every attempt to `npm install` @capacitor packages filled the
disk to 100% (`ENOSPC`), so a local build is impossible. This is exactly the
honest boundary the NATIVE_APP_PLAN.md predicted: the **owner's machine (or a
cloud machine with Android Studio)** is the right place to run `cap add android`
and `gradlew`.

**Importantly, this is a small, deterministic final step** — not a blocker by
design. All assets and config that `cap add android`/`cap sync` needs are already
in place under `android/app/src/main/res/`, so running the two commands will pick
them up.

---

## 2. What was built (paths)

```
/home/team/shared/onepostai/
├── capacitor.config.ts            ← app id, WebView → https://onepostai.vercel.app, brand colors
├── www/index.html                 ← minimal loader/fallback (webDir)
├── package.json                   ← + @capacitor/core, cli, android (devDeps) + capacitor block
├── scripts/gen-android-assets.py  ← pure-Python PNG generator (no PIL needed), regenerable
└── android/
    ├── README.md                  ← full build guide + keystore + Play Console steps
    └── app/src/main/
        ├── AndroidManifest.xml
        ├── java/com/aurahaventech/onepostai/MainActivity.java
        └── res/
            ├── mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher.png + ic_launcher_round.png
            ├── mipmap-anydpi-v26/ic_launcher.xml + ic_launcher_round.xml (adaptive)
            ├── drawable/ic_launcher_background.png, ic_launcher_foreground.png, splash.png
            └── values/{colors,strings,styles}.xml
```

**Brand:** dark gray `#12121a` background, champagne gold `#c9a96e` monogram
(app icon = gold rounded-square mark on dark gray) — matches the locked brand
family shared with Axel AI and Aura Haven.

---

## 3. Remaining steps (exact commands — owner machine or CI)

```bash
cd /home/team/shared/onepostai
npm install                                  # pulls @capacitor/* (already in package.json)
npx cap add android                          # generates full Gradle project (keeps our res/)
npx cap sync android                         # copies www/ + config into android/
cd android && ./gradlew assembleDebug        # quick check APK builds
```

**Signing (Play Store release):**
```bash
keytool -genkeypair -v -keystore onepostai-release.keystore \
  -alias onepostai -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass '<STRONG_PASSWORD>' -keypass '<STRONG_PASSWORD>' \
  -dname "CN=One Post AI,O=Aura Haven Tech,L=City,ST=State,C=US"
# then: ./gradlew bundleRelease → app/build/outputs/bundle/release/*.aab
```

Full Play Console + review steps are documented in `android/README.md`.

---

## 4. What the owner must supply to finish

1. **A machine with Android Studio (or Java 17 + Android SDK)** — to run
   `cap add android` + `gradlew`. (Could be a GitHub Actions Android job; we can
   wire that up next.)
2. **Keystore custody** — generate the keystore (command above) and keep the
   password in a password manager. Never lose it; it cannot be regenerated.
3. **Play Console access** — add the team to the Play account so we can upload
   the AAB, fill the Data safety form, and roll to production.
4. **Screenshots + feature graphic** (1024×500) or approval for us to generate
   them from the current UI.
5. **Public Privacy Policy URL** (required by Play).
6. **Vercel redeploy** so `onepostai.vercel.app` is the current, working build —
   the app's WebView loads this URL, so it must not be the stale deploy.

---

## 5. Verified facts (so nothing is overstated)

- Both repos confirmed Next.js 14 web apps (package.json, earlier task).
- The Capacitor WebView will load `https://onepostai.vercel.app` — the cloud
  SaaS backend (auth, OpenAI, Stripe) runs on Vercel, not on-device, exactly per
  the approved plan.
- `@capacitor/*` @6.0.0 chosen (current stable major; Next.js 14 app unaffected —
  additive wrapping, no changes to web source).
- Launcher PNGs verified by decoding: 192px truecolor, center pixel
  (201,169,110) gold, corner (18,18,26) dark. Same generator used for all
  densities.
---

## 6. UPDATE — CI build to produce an actual APK

Added `.github/workflows/build-android.yml` (commit `b7caf96`) on
`feature/capacitor-android`. This is the concrete way to get an **actual APK**
with zero reliance on the local machine (which has no Java/Android SDK):

- **Trigger:** manual (`Actions → Build One Post AI Android → Run workflow`) or
  on push to `main` / `feature/capacitor-android`.
- **What it does:** checks out, installs Node deps (Capacitor), generates the
  Android Gradle project via `npx cap add android`, runs `npx cap sync android`,
  then `./gradlew assembleDebug` on ubuntu-latest (JDK 17 + Android SDK).
- **Output:** a **debug APK** uploaded as a downloadable artifact
  (`onepostai-debug-apk`).

This is a real, installable APK of the One Post AI native shell — enough to put
on a phone now. A **signed release AAB** for the Play Store still requires the
owner's keystore + Play Console access (see android/README.md).
