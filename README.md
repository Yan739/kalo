# Kalo

Tracker calorique personnel, offline-first, equivalent gratuit de Yazio pour un usage mono-utilisateur. Construit avec Expo et React Native.

## Stack

- Expo (managed workflow), SDK 56
- TypeScript strict
- expo-router (navigation par onglets)
- expo-camera (scan de code-barres)
- expo-sqlite (persistance locale)
- @tanstack/react-query (cache des appels Open Food Facts)
- zustand (etat global du jour)

## Installation

```bash
npm install
```

Si une dependance native manque apres un clone, reinstaller les versions alignees au SDK :

```bash
npx expo install
```

## Lancer l'application

```bash
npx expo start
```

Puis ouvrir sur un appareil ou un simulateur (`i` pour iOS, `a` pour Android).
Le scan de code-barres requiert un appareil reel ou un build avec la camera ;
expo-camera fonctionne dans Expo Go.

## Architecture

```
src/
  app/
    _layout.tsx            providers (React Query, theme) + Stack
    (tabs)/
      _layout.tsx          navigation a 3 onglets
      index.tsx            ecran Aujourd'hui
      scan.tsx             scan code-barres + ajout au journal
      profile.tsx          profil et objectifs
  db/
    schema.ts              tables + migrations versionnees
    client.ts              ouverture SQLite + helpers de requete
    repositories/          profileRepo, logRepo, foodCacheRepo
  services/
    nutrition.ts           moteur calorique (fonctions pures)
    openfoodfacts.ts       client API Open Food Facts
    date.ts                cle de date locale
  store/
    useDayStore.ts         totaux du jour, objectif, refresh
  hooks/
    use-product.ts         React Query (cache local puis OFF)
  types/
    domain.ts              Profile, FoodItem, LogEntry, DailyTotals
  components/
    MacroBar, NutritionRing, QuantityInput, OptionGroup
```

## Moteur calorique

`src/services/nutrition.ts` regroupe des fonctions pures (sans UI ni DB) :
BMR (Mifflin-St Jeor), TDEE par facteur d'activite, objectif kcal par
ajustement, et repartition des macros (defaut 30 / 40 / 30 pour
proteines / glucides / lipides). Testable isolement.

## Donnees externes

Source unique en Phase 1 : l'API publique Open Food Facts. Un appel correspond
a un scan reel ; chaque produit scanne est mis en cache local (table `food`)
pour eviter de re-interroger un code-barres deja connu. L'application fonctionne
hors connexion pour tout, sauf le premier scan d'un produit non encore en cache.

## Perimetre Phase 1

Inclus : profil et objectifs, scan et ajout au journal, ecran du jour avec
totaux vs objectif et barres de macros, suppression d'une entree, persistance
SQLite.

Hors scope : IA (langage naturel, photo, HuggingFace), proxy Cloudflare Workers,
recherche texte, favoris, historique multi-jours, graphes, authentification et
synchronisation cloud.
