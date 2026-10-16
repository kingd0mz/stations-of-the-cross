# Stations of the Cross

Minimal Android application built with Expo SDK 57, React Native, and TypeScript.
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
npx expo-doctor
npm run export:android
```

Physical-device smoke check: install the development APK, start Metro, and confirm
the title and introductory text render with no error screen. For the preview APK,
close Metro, enable airplane mode, and relaunch to verify the bundled app starts offline.
An export check alone does not verify an APK build or device launch.

Initial SDK 58 validation (2026-10-16): typecheck, lint, all 20 Expo Doctor checks,
Android export, and local Metro startup/status passed. The signed SDK 58
[development APK build](https://expo.dev/accounts/kingd0mz/projects/stations-of-the-cross/builds/fc480132-115b-40de-9c6d-c501ce1d44b2)
completed successfully; this is a historical build, not an SDK 57 artifact.
Physical-phone launch and airplane-mode checks remain pending.

SDK 57 validation (2026-10-16): typecheck, lint, all 21 Expo Doctor checks,
Android export, and Expo Go server startup passed. The server manifest reports
SDK `57.0.0`. No SDK 57 native APK build or physical-phone launch has been verified yet.

`npm audit` reports 22 transitive dependency findings (7 moderate, 15 high) in the
initial Expo dependency tree. Its suggested framework downgrades are incompatible
with this SDK; resolve through compatible upstream updates rather than `npm audit fix --force`.

## Scope

This initial setup contains one placeholder screen. Full station prayers, artwork,
navigation, and prayer progress are future work. All prayer content and assets must
be bundled with the app; no backend, authentication, networking API, analytics SDK,
remote content, or additional state library is included. Development tooling uses
Metro/EAS; standalone preview and production builds do not require those services
at runtime. No OTA update service is configured.

The PNGs in `assets/` are Expo template icon placeholders (including adaptive and
monochrome Android variants); replace them with final artwork before release.

Build profile reference: [Expo EAS configuration](https://docs.expo.dev/build/eas-json/).
