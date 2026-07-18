# AGENTS.md

# Projet : Gestionnaire d'alias e-mail enrichi

## Objectif

Cette application est un gestionnaire d'alias e-mail enrichi.

Elle permet :

- de créer, modifier et supprimer des alias via des fournisseurs externes (ex. OVH)
- d'ajouter des métadonnées métier absentes des fournisseurs
- de retrouver rapidement les alias par service, tags ou critères personnalisés
- de générer rapidement de nouveaux alias
- d'améliorer l'expérience quotidienne de gestion des alias

Le projet ajoute une couche métier au-dessus des fournisseurs d'alias.

Le fournisseur externe gère l'exécution technique.
L'application gère le contexte, l'organisation et l'expérience utilisateur.

---

# Architecture métier

## Principe fondamental

Séparer strictement :

```

Provider externe
↓
Service métier
↓
Repository local
↓
API backend
↓
Interface utilisateur

```

Le modèle métier de l'application ne doit jamais dépendre directement du modèle d'un fournisseur.

---

# Structure générale du projet

```

mail-alias-manager/

├── frontend/
│
├── backend/
│
├── data/
│
├── docs/
│
├── package.json
│
└── AGENTS.md

```

---

# Frontend

## Responsabilité

Le frontend est responsable uniquement :

- de l'affichage
- des interactions utilisateur
- de la navigation
- de la consommation de l'API backend

Il ne communique jamais directement avec un fournisseur externe.

Structure :

```

frontend/
├── src/
│   ├── components/
│   ├── features/
│   │   └── aliases/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   └── types/
│
├── package.json
└── vite.config.ts

```

---

# Backend

## Responsabilité

Le backend est responsable :

- de la logique métier
- de la communication avec les fournisseurs externes
- de la persistance locale
- de l'exposition de l'API REST

Structure :

```

backend/
├── src/
│
│   ├── modules/
│   │   └── aliases/
│   │       ├── alias.controller.ts
│   │       ├── alias.service.ts
│   │       ├── alias.repository.ts
│   │       └── alias.generator.ts
│   │
│   ├── providers/
│   │   └── ovh/
│   │       ├── ovh.client.ts
│   │       └── ovh.mapper.ts
│   │
│   ├── db/
│   │   ├── schema.ts
│   │   └── migrations/
│   │
│   ├── middleware/
│   ├── validators/
│   └── lib/
│
└── package.json

```

---

# Domaine Alias

L'entité principale est l'alias.

Le modèle local enrichit les données fournies par le provider.

Exemple :

```ts
{
  id: string,

  email: string,

  provider: "ovh",

  providerId: string,

  domain: string,

  destination?: string,

  serviceName?: string,

  description?: string,

  tags: string[],

  createdAt: Date,

  updatedAt: Date,

  lastSyncAt?: Date
}
```

Le champ `destination` contient l'adresse vers laquelle l'alias redirige (pertinent pour les redirections OVH, champ `to`).

Les informations métier restent locales.

Exemples :

* nom du service associé
* description
* tags
* favoris
* classement
* historique local

---

# Fournisseurs externes

Les fournisseurs mail sont isolés derrière une couche dédiée.

Exemple :

```
backend/src/providers/

└── ovh/
    ├── ovh.client.ts
    └── ovh.mapper.ts
```

Responsabilités :

* récupérer les alias
* créer un alias
* modifier un alias
* supprimer un alias
* transformer les données fournisseur vers le modèle interne

Ajouter un nouveau fournisseur ne doit pas modifier la logique métier principale.

## Mapping domaine → fournisseur

La correspondance entre un domaine et son fournisseur est stockée en base (table `settings`, clé `domain_providers`), configurable via la page Settings de l'UI. Format : JSON `Record<string, string>` mappant domaine → nom de fournisseur.

Les domaines sans fournisseur configuré sont ignorés silencieusement par la synchronisation.

La logique d'orchestration (alias.service.ts) ne contient jamais de référence codée en dur à un fournisseur spécifique.

Elle utilise le mapping pour router chaque domaine vers le bon provider.

## Spécificité OVH

OVH utilise l'API de redirections email (pas les alias de compte MX Plan).

Endpoints :

* `GET    /email/domain/{domain}/redirection` — liste les IDs
* `GET    /email/domain/{domain}/redirection/{id}` — détail `{id, from, to}`
* `POST   /email/domain/{domain}/redirection` — crée `{from, to, localCopy}`
* `DELETE /email/domain/{domain}/redirection/{id}` — supprime

Le `from` correspond à l'alias email. Le `to` correspond à la destination.

Le `providerId` stocké est l'ID numérique OVH sous forme de string.

---

# Génération d'alias

La génération automatique d'alias est une fonctionnalité métier indépendante.

Elle doit être isolée :

```
backend/src/modules/aliases/alias.generator.ts
```

Responsabilités :

* génération de noms aléatoires
* utilisation d'un dictionnaire de mots
* validation du format
* prévention des collisions

Exemples :

```
green-otter-482@domain.com

silent-river-93@domain.com
```

La génération ne doit jamais contenir de logique fournisseur.

---

# Stack technique

## Frontend

* React
* Vite
* TypeScript
* React Router
* Tailwind CSS
* shadcn/ui

## Backend

* Express
* TypeScript
* Zod
* Axios ou fetch pour les APIs externes

## Base locale

SQLite.

Accès via :

* Drizzle ORM

La base SQLite contient les données métier enrichies.

Elle ne remplace pas les fournisseurs externes.

---

# Base de données

SQLite est la source locale des données métier.

Utilisation via Drizzle ORM.

La base stocke :

* métadonnées utilisateur
* informations de classement
* synchronisation provider
* préférences locales

Les migrations doivent être versionnées.

Le stockage doit rester facilement exportable et sauvegardable.

---

# API backend

Architecture REST.

Exemples :

```
GET    /aliases

POST   /aliases

PUT    /aliases/:id

DELETE /aliases/:id

POST   /aliases/generate

POST   /aliases/sync
```

Les actions fournisseur passent obligatoirement par les services métier.

Le frontend ne contacte jamais directement un fournisseur externe.

---

# Synchronisation fournisseur

La synchronisation doit être explicite.

Exemples :

* synchronisation manuelle
* synchronisation après modification
* synchronisation future planifiée

## Streaming

L'endpoint `POST /api/aliases/sync` répond en NDJSON (newline-delimited JSON).

Chaque ligne est un objet JSON suivi de `\n` :

```json
{"type":"log","message":"┌─ Domain: tical.fr"}
{"type":"log","message":"│  [1/67] + NEW  #12345  alias@domain.fr → dest@mail.com"}
{"type":"result","data":{"new":67,"updated":0,"total":67,"errors":[],"logs":["..."]}}
```

Le frontend lit le flux en temps réel avec `response.body.getReader()` et affiche les logs ligne par ligne.

## Gestion des erreurs

Différencier :

```
Erreur provider
≠
Erreur base locale
≠
Erreur validation utilisateur
```

Les domaines sans fournisseur configuré sont ignorés sans erreur. Seuls les échecs réels d'API comptent comme erreurs.

---

# Fonctionnalités principales

## CRUD Alias

Permettre :

* création
* lecture
* modification
* suppression

avec synchronisation fournisseur.

---

## Quick New Alias

Parcours rapide :

1. Choisir un domaine.
2. Générer ou saisir un alias.
3. Associer un service.
4. Créer l'alias chez le provider.
5. Sauvegarder les métadonnées locales.

---

## Recherche

Recherche possible par :

* adresse email
* service
* tags
* description

---

# Contraintes spécifiques

* OVH est un fournisseur, pas le modèle métier.
* Les métadonnées utilisateur sont toujours locales.
* Toute interaction fournisseur passe par `providers/`.
* Toute logique métier passe par `modules/`.
* Toute génération d'alias passe par `alias.generator.ts`.
* Le frontend ne contient aucune logique métier critique.
* Le backend est la seule source d'orchestration.
* Les noms de fournisseurs ne sont jamais codés en dur dans la logique d'orchestration.
* La correspondance domaine → fournisseur est centralisée dans `DOMAIN_PROVIDERS`.
* Les logs de synchronisation ne mentionnent pas de fournisseur spécifique (ex. éviter « pas géré par OVH »).

---

# Build & déploiement

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance `tsx watch` (backend) + `vite` (frontend) en parallèle |
| `npm run build` | Build tous les workspaces (backend, frontend) |
| `npm run db:generate` | Génère les fichiers de migration SQL (`-w @prismel/backend`) |
| `npm run db:push` | Pousse le schéma vers SQLite (`-w @prismel/backend`) |
| `bash scripts/deploy.sh` | Génère l'archive `.tar.gz` de déploiement hors-ligne |

## Déploiement

Le script `scripts/deploy.sh` produit une archive autonome contenant :

- `backend/dist/` compilé
- `public/` (build frontend statique)
- `node_modules/` production (modules natifs linux/x64)
- `backend/dist/db/migrations/` (SQL de migration)
- `.env.prod` (template)

L'archive pré-définit les permissions (dossiers 755, fichiers 644). Sur le serveur, seul `chown -R` est nécessaire pour adapter le propriétaire.

Sur le serveur : `node backend/dist/db/migrate.js` initialise la base sans drizzle-kit (utilise `drizzle-orm/migrator`).

## Gotchas ESM

### Extensions `.js` sur les imports relatifs

Le backend utilise `"type": "module"` (ESM). Node.js ESM exige les extensions `.js` explicites sur tous les imports relatifs.

- Écrire `import { config } from "./lib/config.js"` (pas `"./lib/config"`)
- TypeScript résolve `./lib/config.js` vers `./lib/config.ts` à la compilation
- Les imports de répertoire doivent pointer vers l'index : `import { db } from "../../db/index.js"`

Le `backend/tsconfig.json` garde `moduleResolution: bundler` car `better-sqlite3`, `express`, `cors` sont des modules CJS sans `exports` ESM et cassent sous `NodeNext`. Sans enforcement à la compilation, toute omission de `.js` compile mais échoue au runtime.

### Chemin de la base de données

`backend/src/db/index.ts` et `backend/src/db/migrate.ts` résolvent le chemin de la base via `import.meta.dirname` (pas `process.cwd()`). Les scripts npm avec `-w @prismel/backend` changent le cwd à `backend/`, casserait un chemin relatif simple. Le résolveur remonte trois niveaux depuis `db/` (que ce soit `src/db/` en dev via tsx ou `dist/db/` en prod) pour atteindre `data/prismel.db` à la racine du projet.

### `drizzle.config.ts`

Les chemins dans `drizzle.config.ts` sont relatifs à `backend/` (cwd du workspace). Toujours utiliser `npm run db:* -w @prismel/backend`, jamais `npx drizzle-kit` directement depuis la racine.

## Self-update

Cet `AGENTS.md` doit être mis à jour à chaque changement significatif du projet : stack, conventions de code, structure, commandes de build/deploy, gotchas. Si un nouveau piège ESM ou de résolution est découvert, l'ajouter ici.