# Exercice technique – Fullstack JS (React + NodeJS)

## Objectif

Réaliser une **mini application de gestion de tâches** en React (frontend) et NodeJS (backend).

L’objectif de cet exercice n’est pas de construire une application complète ou parfaite, mais d’évaluer :
- la clarté du raisonnement
- la qualité et la lisibilité du code
- la capacité à faire des choix techniques pertinents

---

## Cadre

- **Temps recommandé** : 2 à 3 heures
  (merci de ne pas dépasser ce temps)
- **Format** : exercice à réaliser chez vous
- **Stack imposée** :
  - Frontend : **React**
  - Backend : **NodeJS**
- Le reste est libre (frameworks, outils, organisation)

---

## Fonctionnalités attendues

### Backend

Créer une API REST permettant de :

1. **Lister les tâches**
   - `GET /tasks`

2. **Créer une tâche**
   - `POST /tasks`
   - champ requis : `title`

3. **Mettre à jour le statut d’une tâche**
   - `PATCH /tasks/:id`
   - statuts possibles : `todo`, `done`

Les données peuvent être stockées **en mémoire** (aucune base de données requise).

---

### Frontend

Créer une interface permettant de :

- afficher la liste des tâches
- ajouter une tâche
- changer le statut d’une tâche
- afficher un état de chargement lors des appels réseau
- afficher un message d’erreur en cas d’échec

Aucun design particulier n’est attendu.

---

## Contraintes & attentes

- Pas d’authentification
- Pas de base de données
- Le code doit être **lisible, structuré et maintenable**
- Les choix techniques doivent être **assumés**
- Vous pouvez faire des **hypothèses**, à condition de les documenter

> Il vaut mieux faire peu mais bien que vouloir tout faire.

---

## Livrables attendus

1. Le code source (dans ce repository sur votre branche)
2. Un fichier `README.md` contenant :
   - les instructions pour lancer le projet
   - les principaux choix techniques
   - les hypothèses prises
   - ce que vous amélioreriez dans un contexte de production

---

## Indications

- Le code sera relu par d’autres développeurs
- Pensez à la gestion des erreurs
- Pensez à la maintenabilité
- Pensez au contrat entre le frontend et le backend
- Des `TODO` clairs sont préférables à du code bâclé

---

## Questions ouvertes (facultatives)

À traiter uniquement si vous avez le temps :

- Quels tests écririez-vous en priorité ?
- Comment feriez-vous évoluer cette application à plus grande échelle ?

---

## Important

> Privilégiez une solution **simple, propre et expliquée**
> plutôt qu’une solution incomplète ou sur-complexe.

Bonne chance 🙂