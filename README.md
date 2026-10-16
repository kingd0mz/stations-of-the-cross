# New Way of the Cross

Offline booklet reader for Android built with Expo SDK 57, React Native, and TypeScript.
Application ID: `com.kingd0mz.stationsofthecross`. Initial version: `1.0.0` (Android version code `1`).

## Setup

Use Node.js 22.13 or newer and npm.

```sh
npm ci
npm run start:go -- --clear
```

Use Expo Go for SDK 57 on your Android phone. Connect the phone and computer to the
same Wi-Fi network, then scan the terminal's QR code in Expo Go. No development APK
is needed for this workflow. The `start:go` script explicitly selects Expo Go even
though the project also includes `expo-dev-client` for native development builds.
On Windows PowerShell, use `npm.cmd` / `npx.cmd` if script execution is disabled.

## Android builds

EAS builds in the cloud; an Expo account is required. For a new checkout, log in and
link the app to an EAS project if it is not already linked:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile development
```

Install the resulting development APK using the build page's QR code/download,
then run `npm start -- --dev-client` to load this app.
Rebuild development APKs after changing the Expo SDK; the earlier SDK 58 APK cannot
load this SDK 57 project.

```sh
# Standalone test APK: bundles JavaScript and assets, runs without Metro or internet
npx eas-cli@latest build --platform android --profile preview

# Google Play release AAB (not directly installable); increments Android versionCode
npx eas-cli@latest build --platform android --profile production
```

EAS can generate and manage the Android signing keystore during the first build.
Keep signing credentials out of Git. Build commands do not submit to Google Play.

For a local development build, install Android Studio's SDK and JDK, set
`ANDROID_HOME` and `JAVA_HOME`, enable USB debugging on a physical Android phone,
and authorize the computer. Then run:

```sh
adb devices
npm run android
```

Expo generates the ignored `android/` directory from `app.json`; native configuration
belongs in app config rather than manual edits to generated files.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx expo-doctor
npm run export:android
```

The dependency-free Node test suite checks both editions' page IDs and placeholder
status, navigation boundaries, direction locking and multi-touch cancellation,
saved-value validation, read failures, and ordered writes recovering from errors.
An export check alone does not verify a phone launch or native gestures.

### Expo Go smoke test

1. Run `npm run start:go -- --clear` and scan the QR code in Expo Go **SDK 57**.
   Stop any older Metro server before starting. There is no onboarding or login.
2. Swipe left/right through opening, Stations I–XIV, and concluding prayer. Short
   or mostly vertical drags must not change stations. Scroll a station from top to
   bottom; begin vertically and then move sideways to check the direction lock.
3. Open **Pages**, jump to XIV, close the selector with Android Back, then use
   **Start from Beginning**. Previous/Next stop at the booklet boundaries.
4. At a middle station, select FIL. The same station remains selected, with visibly
   marked Filipino placeholders rather than English prayer text. Switch back to EN.
5. Increase text with **A+**; check scrolling and all controls on a small screen,
   also with Android's large system font/display settings. Decrease with **A−**.
6. Choose FIL, a middle station, and a larger font. Wait a moment for local storage,
   close/reopen the project, and check all three return without flashing the opening
   page. Android Back goes to the previous booklet page; at opening it exits normally.
7. After loading the bundle, enable airplane mode and navigate all pages and toggle
   languages. A **preview APK** is the reliable test for a cold offline launch:
   Expo Go/dev clients may need Metro to reload the JavaScript bundle.

Storage uses `@new-way-of-the-cross/preferences/v1`. Malformed JSON, stale IDs,
unsupported languages, and invalid font sizes are sanitized independently. Storage
failures show a non-blocking message; reading remains available. Page and language
changes reset the current page's vertical scroll to its top. Scroll offset is not
persisted. Font adjustments preserve the mounted scroll view.

Initial SDK 58 validation (2026-10-16): typecheck, lint, all 20 Expo Doctor checks,
Android export, and local Metro startup/status passed. The signed SDK 58
[development APK build](https://expo.dev/accounts/kingd0mz/projects/stations-of-the-cross/builds/fc480132-115b-40de-9c6d-c501ce1d44b2)
completed successfully; this is a historical build, not an SDK 57 artifact.
Physical-phone launch and airplane-mode checks remain pending.

SDK 57 MVP validation (2026-10-16): typecheck, lint, eight Node tests, all 21 Expo
Doctor checks, Android export, and Expo Go server/SDK 57 manifest checks passed.
No SDK 57 native APK build or physical-phone launch has been verified yet.

`npm audit` reports 22 transitive dependency findings (7 moderate, 15 high) in the
initial Expo dependency tree. Its suggested framework downgrades are incompatible
with this SDK; resolve through compatible upstream updates rather than `npm audit fix --force`.

## Scope

The reader has 16 logical pages, horizontal swipe navigation, vertical scrolling,
a page selector, EN/FIL switching, and four locally saved font sizes (18–28).
Preferences load before the reader renders. All content is bundled locally;
there is no backend, authentication, networking API, analytics SDK,
remote content, or additional state library is included. Development tooling uses
Metro/EAS; standalone preview and production builds do not require those services
at runtime. No OTA update service is configured.

`App.tsx` remains the entry screen. `src/content/` contains the typed editions and
UI labels; `src/reader/` contains the renderer, gesture rules, and preference store.
Only the current page is mounted. There is no router or UI framework. AsyncStorage
and safe-area support are the only added runtime dependencies for this MVP.
Keep-screen-awake and a PWA are intentionally outside this implementation. Components
use React Native primitives and local assets to allow a future Expo Web target;
web packaging and hosting are not configured.

Prayer material and illustrations await verified editions and redistribution rights.
See [CONTENT.md](CONTENT.md) before adding any devotional text or images.

## GitHub issues #1–#6

All six issues and their comment threads were reviewed before implementation.
This table describes implemented behavior, not a claim of physical-device validation.

| Issue | Implemented | Outstanding |
| --- | --- | --- |
| #1 Setup | Existing SDK 57 project, identity, EAS profiles, bundled assets, no services | SDK 57 APK build and physical Android launch; historical SDK 58 build is linked above |
| #2 Content | Typed English/Filipino files; stable IDs; scripture/reference, responses, reflection, prayer, pause, hymn, illustration structures | Exact booklet identification, verified texts/transcription, Filipino edition, proofreading, rights/credits; all passages remain placeholders |
| #3 Reader | All 16 pages, horizontal/vertical navigation with direction lock, selector, restart, bounded buttons; no effects/login | Phone gesture and small-screen usability checks; complete prayers depend on #2 |
| #4 Design | Warm paper/red/native text, distinct Leader/All styles, responsive line width, font controls; no remote fonts/images | Authorized optimized illustrations, low-end-phone testing, source fidelity review, release download-size measurement/under-10-MB goal |
| #5 Language | Bundled EN/FIL toggle, common IDs preserve station, localized UI and explicit Filipino placeholders | Complete verified bilingual prayer material; phone/offline checks |
| #6 Persistence | AsyncStorage page/language/font, validation, hydration gate, restart, storage errors | Phone close/reopen check; optional keep-screen-awake omitted |

The PNGs in `assets/` are Expo template icon placeholders (including adaptive and
monochrome Android variants); replace them with final artwork before release.

Build profile reference: [Expo EAS configuration](https://docs.expo.dev/build/eas-json/).
