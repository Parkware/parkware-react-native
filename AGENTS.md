# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Parkware is a React Native (Expo SDK 51) mobile app for peer-to-peer event parking space sharing, with Firebase Cloud Functions in `functions/`. See `README.md` for the core workflow.

### Services

| Service | How to run | Port |
|---|---|---|
| Expo dev server (web) | `npx expo start --web --port 8081` | 8081 |
| Firebase Firestore emulator | `firebase emulators:start --only firestore` | 8082 (data), 4000 (UI) |
| Cloud Functions build (watch) | `cd functions && npm run build:watch` | N/A |

### Lint / Build / Test

- **Lint Cloud Functions:** `cd functions && npm run lint`
- **Build Cloud Functions:** `cd functions && npx tsc` (or `npm run build` which also lints first)
- **TypeScript check root project:** `npx tsc --noEmit` (expect pre-existing TS errors in `EventBlock.tsx` — missing React import)

### Gotchas

- This is a **mobile app**. Full native testing requires iOS Simulator (macOS) or Android Emulator (GPU). On a headless Linux VM, use `npx expo start --web` to run the web version.
- The web version of the app requires `react-native-web`, `react-dom`, and `@expo/metro-runtime` — install via `npx expo install react-native-web react-dom @expo/metro-runtime` if missing.
- `firebaseConfig.ts` uses `getReactNativePersistence` which does not work on web. The login screen renders but Firebase Auth calls will fail in web mode. This is expected for a mobile-first app.
- Firebase Cloud Functions require Node 20 per `functions/package.json` engine field. Node 22 works fine for `npm install` and `tsc` but shows a warning.
- Java is required for the Firebase Firestore emulator (`firebase emulators:start`).
- There is no Jest test configuration or test files in this repo currently. The `jest` and `jest-expo` packages are listed as dependencies but no tests exist.
- The `.eslintrc.js` config for functions references `tsconfig.dev.json` in `parserOptions.project` but that file does not exist — linting still works because the main `tsconfig.json` is found.
