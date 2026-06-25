# Kalo

Tracker calorique personnel, offline-first, equivalent gratuit de Yazio pour un usage mono-utilisateur. Construit avec Expo et React Native.

## Stack

- Expo (managed workflow), SDK 56
- TypeScript strict
- expo-router (navigation par onglets)
- expo-camera (scan de code-barres), expo-image-picker (photo d'assiette)
- expo-sqlite (persistance locale)
- @tanstack/react-query (cache des appels Open Food Facts)
- zustand (etat global du jour)
- react-native-health-connect (sync Health Connect / Samsung Health)

## Installation

```bash
npm install
```

Si une dependance native manque apres un clone :

```bash
npx expo install
```

## Lancer en developpement

```bash
npx expo start
```

Profil et journal fonctionnent dans Expo Go. Le scan de code-barres, la photo
d'assiette (HuggingFace) et Health Connect necessitent un build standalone
(voir Phase 2).

## Architecture

```
src/
  app/
    _layout.tsx            providers (React Query, theme) + Stack
    (tabs)/
      _layout.tsx          navigation a onglets
      index.tsx            ecran Aujourd'hui + sync montre
      scan.tsx             scan code-barres + ajout au journal
      plate.tsx            photo d'assiette + reconnaissance IA
      profile.tsx          profil et objectifs
  db/
    schema.ts              tables + migrations versionnees
    client.ts              ouverture SQLite + helpers de requete
    repositories/          profileRepo, logRepo, foodCacheRepo
  services/
    nutrition.ts           moteur calorique (fonctions pures)
    openfoodfacts.ts       client API Open Food Facts
    huggingface.ts         client classification d'image
    healthConnect.ts       ecriture nutrition / lecture calories actives
    date.ts                cle de date locale
  store/
    useDayStore.ts         totaux du jour, objectif, refresh
  hooks/
    use-product.ts         React Query (cache local puis OFF)
  types/
    domain.ts              Profile, FoodItem, LogEntry, DailyTotals
  constants/
    foodNutrition.ts       table nutritionnelle des plats Food-101
  components/
    MacroBar, NutritionRing, QuantityInput, OptionGroup, HealthSync
```

## Moteur calorique

`src/services/nutrition.ts` regroupe des fonctions pures (sans UI ni DB) :
BMR (Mifflin-St Jeor), TDEE par facteur d'activite, objectif kcal par
ajustement, et repartition des macros (defaut 30 / 40 / 30 pour
proteines / glucides / lipides). Testable isolement.

## Donnees externes (Phase 1)

Source unique : l'API publique Open Food Facts. Un appel correspond a un scan
reel ; chaque produit scanne est mis en cache local (table `food`) pour eviter
de re-interroger un code-barres connu. L'application fonctionne hors connexion
pour tout, sauf le premier scan d'un produit non encore en cache.

## Phase 2 : assiette IA et montre

Ces fonctionnalites utilisent des modules natifs (photo, Health Connect) et le
reseau. Elles ne fonctionnent pas dans Expo Go : il faut un build standalone
(APK ou development build).

### Build APK (Android)

Profil `preview` defini dans `eas.json` (sortie APK) :

```bash
npm install -g eas-cli
eas login
eas init
eas build -p android --profile preview
```

EAS renvoie un lien de telechargement du `.apk`. En local sans compte cloud :
`npx expo prebuild -p android` puis `cd android && ./gradlew assembleRelease`
(JDK 17 + Android SDK requis).

### Reconnaissance d'assiette (HuggingFace)

L'onglet Assiette prend une photo, la classe via l'API d'inference HuggingFace
(modele `nateraw/food` par defaut), puis estime calories et macros a partir
d'une table interne (`src/constants/foodNutrition.ts`). La portion est ajustable
comme pour le code-barres ; les valeurs sont indicatives.

Configurer le token avant de builder :

```bash
cp .env.example .env
# renseigner EXPO_PUBLIC_HF_TOKEN dans .env
```

Token : https://huggingface.co/settings/tokens (role read). La classification
donne le plat, pas la portion exacte.

### Montre Galaxy via Health Connect

L'ecran Aujourd'hui propose un bouton qui ecrit les totaux du jour (kcal,
proteines, glucides, lipides) dans Health Connect et lit les calories actives.
Samsung Health lit Health Connect, donc les donnees remontent vers la montre.

Prerequis sur l'appareil Android :

- installer l'application Health Connect (Play Store) si absente
- dans Samsung Health, activer la connexion a Health Connect
- accorder a Kalo les autorisations Nutrition (ecriture) et Calories actives
  (lecture) au premier appui sur Synchroniser

Health Connect est Android uniquement ; sur iOS la carte est masquee.

## Hors scope actuel

Recherche texte d'aliments, favoris, historique multi-jours et graphes,
authentification et synchronisation cloud, proxy Cloudflare Workers.
