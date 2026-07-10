# GIE FAJAR — Boutique en ligne

Site vitrine et boutique en ligne pour le GIE FAJAR (jus, sirops, confitures artisanaux).

## Installation locale

```bash
npm install
npm run dev
```

## Build de production

```bash
npm run build
```

Le résultat est généré dans le dossier `dist/`.

## Déploiement (recommandé : Vercel)

1. Pousser ce dossier dans le repo GitHub.
2. Sur [vercel.com](https://vercel.com), cliquer sur "New Project" et importer le repo.
3. Vercel détecte automatiquement Vite — aucune configuration nécessaire.
4. Cliquer sur "Deploy".

Le site sera en ligne en 1 à 2 minutes, avec une URL du type `gie-fajar-boutique.vercel.app`.
On pourra ensuite y attacher un nom de domaine personnalisé (ex: `boutique.fajar.sn`) depuis les réglages du projet Vercel.

## Structure

- `src/App.jsx` — l'application complète (catalogue, panier, commande)
- `src/main.jsx` — point d'entrée React
- `public/logo.png` — logo du GIE FAJAR
- `index.html` — page HTML de base

## Données

Les commandes et le stock sont stockés dans le navigateur (localStorage) pour cette première version.
Pour une vraie mise en production avec plusieurs utilisateurs (équipe + clients), il faudra brancher une base de données partagée — à voir avec Claude pour la suite.
