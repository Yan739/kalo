# Kalo

<div align="center">

![Expo](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-offline%20first-003B57?logo=sqlite&logoColor=white)
![Health Connect](https://img.shields.io/badge/Health%20Connect-Samsung%20Health-1428A0?logo=samsung&logoColor=white)

</div>

> **A personal, offline-first calorie tracker built with Expo and React Native — barcode scanning, AI plate recognition, goal-oriented coaching, and Samsung Health sync. A free, single-user alternative to Yazio.**

---

## At a glance (for reviewers & recruiters)

Kalo is a **personal mobile application** built to practice modern React Native patterns and to serve my own nutrition tracking needs. Every technical decision was made with production quality in mind: a pure, testable domain engine, a versioned local SQLite layer, typed service boundaries, and zero hosted backend. All data lives on the device.

**What it demonstrates**

- **Pure domain engine**: the calorie engine (`nutrition.ts`) and coaching engine (`coaching.ts`) are side-effect-free functions — no UI, no DB — and are unit-testable in isolation. BMR, TDEE, goal adjustment, macro split and weekly weight projection are all pure math.
- **Clean service architecture**: each concern is isolated — `openfoodfacts.ts` owns the food API, `huggingface.ts` owns image classification, `healthConnect.ts` owns the Samsung Health bridge, the SQLite `repositories/` own persistence. Screens are thin orchestrators.
- **Offline-first persistence**: `expo-sqlite` with an idempotent schema and a versioned migration system (`PRAGMA user_version`). Scanned products are cached locally so a known barcode is never re-fetched.
- **Typed data flow**: TypeScript in strict mode, explicit domain entities, discriminated unions for async results (`SyncResult`, typed error classes for the AI client).
- **Reactive state**: `zustand` for the live day state (totals, goal, health snapshot) and `@tanstack/react-query` for cached network reads.
- **Native integrations**: barcode scanning (`expo-camera`), photo capture (`expo-image-picker`), and read/write to Health Connect / Samsung Health (`react-native-health-connect`).

**Stack:** Expo SDK 56 · React Native 0.85 · TypeScript (strict) · expo-router · expo-sqlite · @tanstack/react-query · zustand · react-native-health-connect · Open Food Facts · HuggingFace Inference

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Data flow](#data-flow)
- [Nutrition engine](#nutrition-engine)
- [Goal-oriented coaching](#goal-oriented-coaching)
- [Open Food Facts integration](#open-food-facts-integration)
- [AI plate recognition](#ai-plate-recognition)
- [Samsung Health sync](#samsung-health-sync)
- [SQLite schema](#sqlite-schema)
- [Design system](#design-system)
- [Building the APK](#building-the-apk)
- [Configuration](#configuration)
- [Running locally](#running-locally)
- [Roadmap](#roadmap)
- [Motivation](#motivation)

---

## Architecture

```
kalo/
└── src/
    ├── app/               # expo-router file-based routes
    │   ├── _layout.tsx    # providers (React Query, theme) + root Stack
    │   └── (tabs)/        # tab navigator: Today, Scan, Plate, Profile
    ├── components/        # presentational UI (Card, rings, bars, tiles)
    ├── services/          # business logic & integrations (pure where possible)
    ├── db/                # SQLite client, schema/migrations, repositories
    ├── store/             # zustand global day state
    ├── hooks/             # React Query data hooks
    ├── constants/         # theme tokens, labels, nutrition table
    └── types/             # domain entities & enums
```

State is never shared directly between screens. Screens read from a single `zustand` store and call service methods — a deliberate choice to keep the dependency graph flat and the domain logic testable.

```
Services / SQLite (state + logic layer)
    │
    ├── pure engines        → nutrition, coaching (no side effects)
    ├── repositories        → the only way to touch the database
    └── integrations        → Open Food Facts, HuggingFace, Health Connect
         │
         ▼
    Store (zustand) + React Query (cache)
         │
         ▼
    Screens (UI layer)
         ├── read current state
         └── call service methods on user interaction
```

---

## Tech stack

| Technology | Version | Role |
|---|---|---|
| Expo | SDK 56 | Managed React Native toolchain |
| React Native | 0.85 | Mobile UI framework |
| TypeScript | strict | Language |
| expo-router | 56 | File-based navigation (tabs) |
| expo-camera | 56 | Barcode scanning |
| expo-image-picker | 56 | Plate photo capture |
| expo-sqlite | 56 | Local persistence |
| @tanstack/react-query | 5 | Network cache (Open Food Facts) |
| zustand | 5 | Global day state |
| react-native-health-connect | 3 | Samsung Health / Health Connect bridge |
| react-native-svg | 15 | Progress ring rendering |

---

## Project structure

```
src/
├── app/
│   ├── _layout.tsx                  # QueryClient + theme providers, root Stack
│   └── (tabs)/
│       ├── _layout.tsx              # Tab navigator (4 tabs)
│       ├── index.tsx                # Today: ring, goal banner, health tiles, journal
│       ├── scan.tsx                 # Barcode scan + add to journal
│       ├── plate.tsx                # Photo -> AI recognition -> add to journal
│       └── profile.tsx              # Profile + goals, live target recompute
├── services/
│   ├── nutrition.ts                 # Pure calorie engine (BMR, TDEE, macros)
│   ├── coaching.ts                  # Pure goal coaching + budget adjustment
│   ├── openfoodfacts.ts             # Open Food Facts client -> FoodItem
│   ├── huggingface.ts               # Image classification client (typed errors)
│   ├── healthConnect.ts             # Read/write Samsung Health via Health Connect
│   └── date.ts                      # Local date-key helper
├── db/
│   ├── client.ts                    # Open SQLite, query helpers
│   ├── schema.ts                    # Tables + versioned migrations
│   └── repositories/
│       ├── profileRepo.ts           # Single-row profile upsert
│       ├── logRepo.ts               # Journal entries + daily totals
│       └── foodCacheRepo.ts         # Scanned-product cache
├── store/
│   └── useDayStore.ts               # Day totals, goal, health snapshot
├── hooks/
│   └── use-product.ts               # React Query: local cache then OFF
├── constants/
│   ├── theme.ts                     # Color tokens, spacing, accents
│   ├── labels.ts                    # Sex / activity / goal option labels
│   └── foodNutrition.ts             # Food-101 nutrition lookup table
└── types/
    └── domain.ts                    # Profile, FoodItem, LogEntry, DailyTotals...
```

---

## Data flow

### Logging a scanned product (end-to-end example)

```
ScanScreen (expo-camera)
    │
    ├─→ onBarcodeScanned -> setBarcode(data)
    └─→ useProduct(barcode)  (React Query)
         │
         ├─→ foodCacheRepo.getFood(barcode)        # local cache first
         └─→ if miss: openfoodfacts.fetchProduct()  # one network call per real scan
              └─→ foodCacheRepo.upsertFood()         # cache for next time
         │
         ▼
    User sets quantity (grams) -> scaled values computed
         │
         └─→ useDayStore.addEntry()
              ├─→ logRepo.insertEntry()              # persist to SQLite
              └─→ refresh entries + daily totals
                   │
                   ▼
              TodayScreen (subscribed to store)
                   └─→ ring + macro bars re-render
```

---

## Nutrition engine

`src/services/nutrition.ts` is a set of pure functions (no UI, no DB), unit-testable in isolation.

**BMR** — Mifflin-St Jeor equation:

```
Male:   10 * weightKg + 6.25 * heightCm - 5 * age + 5
Female: 10 * weightKg + 6.25 * heightCm - 5 * age - 161
```

**TDEE** = `BMR * activityFactor`

| Activity level | Factor |
|---|---|
| Sedentary | 1.2 |
| Light | 1.375 |
| Moderate | 1.55 |
| Active | 1.725 |
| Very active | 1.9 |

**Daily target** = `TDEE + goalAdjustment`

| Goal | Adjustment (kcal) |
|---|---|
| Fast loss | −500 |
| Slow loss | −250 |
| Maintain | 0 |
| Slow gain | +250 |
| Gain | +500 |

**Macros** (default split 30 / 40 / 30 for protein / carbs / fat): `grams = (targetKcal * percent) / kcalPerGram`, with 4 kcal/g for protein and carbs, 9 kcal/g for fat. Calories are rounded to integers, grams to integers.

---

## Goal-oriented coaching

`src/services/coaching.ts` turns the user's goal into guidance and adapts the daily budget.

- **Advice** — each goal exposes a label, a one-line strategy, a protein tip, and a projected weekly weight change derived from the calorie adjustment (`7700 kcal ≈ 1 kg`). Example: a −250 kcal/day deficit projects to ≈ 0.23 kg/week.
- **Sport-adjusted budget** — when health data is imported, active (workout) calories expand the day's budget. For maintain and gain goals the full amount is added back; for loss goals only half, to preserve the deficit.

The Today screen surfaces this as a colored goal banner and a budget ring that already accounts for the calories you burned.

---

## Open Food Facts integration

`src/services/openfoodfacts.ts` calls the public Open Food Facts API.

- Endpoint: `GET /api/v2/product/{barcode}` with a `fields` projection and an identifying `User-Agent`.
- `status === 1` means the product was found; otherwise a typed `ProductNotFoundError` is thrown.
- Nutriments are mapped to a clean `FoodItem`; missing values become `null` and render as a dash instead of crashing.
- **Fair use**: one API call equals one real scan. Every scanned product is cached in the `food` table, so a known barcode is served from SQLite. Reads are wrapped in React Query (key = barcode, long `staleTime`).

The app works fully offline for everything except the first scan of a product not yet in the cache.

---

## AI plate recognition

The Plate tab captures a photo (camera or gallery) and classifies it with the HuggingFace Inference API (default model `nateraw/food`, the Food-101 classifier).

- **Resilient client** (`huggingface.ts`): calls the current `router.huggingface.co` endpoint with a fallback to the legacy inference endpoint, retries on `503` (cold model start) honoring the API's estimated wait, and throws typed errors (`MissingHfTokenError`, `HfHttpError` with status) so the UI can show a precise reason (invalid token, model unavailable, still loading, or network).
- **Nutrition mapping**: the predicted dish is mapped to per-100 g values from an internal table covering all 101 Food-101 classes (`constants/foodNutrition.ts`). The portion is adjustable, exactly like the barcode flow. Values are indicative — the model identifies the dish, not the exact portion.

---

## Samsung Health sync

`src/services/healthConnect.ts` bridges to Samsung Health through Android **Health Connect** (`react-native-health-connect`). Android only; the card is hidden on iOS.

- **Import** — reads today's steps, active calories, total calories and latest weight, and feeds them into the Today screen and the sport-adjusted budget.
- **Export** — writes the day's nutrition totals (energy, protein, carbs, fat) as a `Nutrition` record, which Samsung Health reads back.
- **Safety** — the SDK is initialized and its availability verified (`getSdkStatus`) before any permission request, every call is wrapped, and failures surface as messages (`unavailable` / `denied` / `error`) instead of crashing the app. An "Open Health Connect" shortcut is offered when the provider is missing.

---

## SQLite schema

`src/db/schema.ts` creates the tables idempotently and seeds a versioned migration system (`PRAGMA user_version`) for future evolutions.

| Table | Description |
|---|---|
| `profile` | Single row: sex, age, height, weight, activity level, goal, macro split, and the computed targets |
| `food` | Scanned-product cache keyed by `barcode` (name, brand, per-100 g nutriments, `updated_at`) |
| `log_entry` | Journal entries: `log_date` (YYYY-MM-DD), food reference, quantity, and per-entry kcal/macros |

No backend, no account — all data is local and private to the app sandbox.

---

## Design system

### Color tokens

| Token | Value | Use |
|---|---|---|
| Primary | `#208AEF` | Brand blue, rings, primary actions |
| Energy | `#FF7A45` | Active calories |
| Steps | `#12B886` | Step count |
| Protein / Carb / Fat | `#3E63DD` / `#F5A623` / `#E5484D` | Macro bars |

The palette adapts to light and dark mode via the theme hook. Cards use soft elevation, the calorie ring is rendered with `react-native-svg`, and the goal banner is color-coded by direction (loss / maintain / gain).

### App icon

A white progress-ring monogram (a "K" inside an open ring) on a blue gradient, echoing the in-app nutrition ring. Generated at every required Android density (adaptive foreground/background, monochrome, splash, favicon).

---

## Building the APK

The app uses native modules (camera, SQLite, Health Connect), so it runs in a standalone build rather than Expo Go. The `eas.json` `preview` profile outputs an installable APK.

```bash
npm install -g eas-cli
eas login
eas init
eas build -p android --profile preview
```

EAS returns a download link for the `.apk`. For a local build instead: `npx expo prebuild -p android` then `cd android && ./gradlew assembleRelease` (JDK 17 + Android SDK required).

---

## Configuration

The AI plate feature needs a free HuggingFace token (role: read).

```bash
cp .env.example .env
# set EXPO_PUBLIC_HF_TOKEN in .env   (used by `expo start` in development)
```

For cloud builds, `.env` is git-ignored and not uploaded — the token must be stored as an EAS environment variable so it is injected at build time:

```bash
eas env:create --name EXPO_PUBLIC_HF_TOKEN --value <token> --environment preview --visibility sensitive
```

`EXPO_PUBLIC_HF_MODEL` optionally overrides the model (defaults to `nateraw/food`; changing it breaks the bundled nutrition table mapping). No other environment variables are required.

---

## Running locally

**Prerequisites**: Node.js 18+ · npm 9+

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

Profile and journal work in Expo Go. Barcode scanning, plate recognition and Health Connect require a standalone build (see [Building the APK](#building-the-apk)).

---

## Roadmap

Potential improvements, by impact:

- [ ] History & charts (weight, calories, adherence over time)
- [ ] Target weight + estimated ETA from the real deficit/surplus
- [ ] Food text search & favorites (log without scanning)
- [ ] Meals & smart portions (group by meal, remembered servings)
- [ ] Adaptive TDEE from imported weight + active calories
- [ ] Multi-food plate recognition with portion estimation
- [ ] Reminders & home-screen widget
- [ ] CSV export / local backup
- [ ] Biometric app lock and encrypted database (SQLCipher)

---

## Motivation

Created as a **personal learning project** to:

1. Practice modern React Native / Expo development (SDK 56, new architecture).
2. Design a clean, testable domain layer separated from UI and persistence.
3. Integrate real-world native APIs (camera, Health Connect) and third-party services (Open Food Facts, HuggingFace).
4. Solve my own calorie-tracking needs without a paid app or a hosted backend.

---

*Personal project — single-user — no hosted backend, all data local.*
