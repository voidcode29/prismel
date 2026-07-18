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

## Commandes locales

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance `tsx watch` (backend) + `vite` (frontend) en parallèle |
| `npm run build` | Build tous les workspaces (backend, frontend) |
| `npm run db:generate` | Génère les fichiers de migration SQL (`-w @prismel/backend`) |
| `npm run db:push` | Pousse le schéma vers SQLite (`-w @prismel/backend`) |

Il n'y a plus de script de build de déploiement local : le build de production passe exclusivement par la CI.

## Pipeline CI

Workflow : `.github/workflows/ci.yml`. Deux jobs.

### Job `test` (chaque push et PR)

Tourne dans un container `node:24-bookworm` (Debian 12, glibc 2.36 — même distro que le VPS en prod). Étapes :

1. `actions/checkout@v4`
2. `jdx/mise-action@v2` : installe Node selon `mise.toml` (source unique de vérité pour la version Node)
3. `npm ci`
4. `npm run typecheck --workspaces --if-present`
5. `npm run lint --workspaces --if-present`
6. `npm run build --workspaces --if-present`

### Job `deploy` (push main seulement, après que `test` passe)

Même container, mêmes premières étapes, puis :

1. `npm run db:generate -w @prismel/backend` (`continue-on-error: true` : safety net, les migrations doivent être committées par le développeur en local)
2. Assemblage de l'archive `deploy-build/` : copie `backend/dist/`, `frontend/dist/` → `public/`, `package.json`/`package-lock.json` racine, `backend/package.json`, `backend/drizzle.config.ts`, `backend/src/db/migrations` → `backend/dist/db/migrations`
3. `npm ci --omit=dev` dans le `deploy-build/` (installe uniquement les deps prod, avec les binaires natifs liés contre glibc 2.36 du container)
4. `chmod` : dossiers 755, fichiers 644, `.bin/` 755
5. `tar czf prismel-<run-number>.tar.gz .`
6. SCP de l'archive vers `/tmp/` sur le VPS
7. SSH : stop service, backup de l'actuel (`/tmp/prismel-backup-<timestamp>.tar.gz`), extract de la nouvelle (`--exclude="data"` pour préserver la DB existante), `chown -R githubdeploy:prismel-data /opt/prismel/.` puis `chown prismel:prismel-data /opt/prismel/data`, `node backend/dist/db/migrate.js` si présent, start service, health check via `curl http://localhost:3001/api/settings`
8. `actions/upload-artifact@v4` : archive uploadée sur GitHub Actions (rétention 90 jours, fallback de rollback)

Le `run_number` GitHub est un entier monotone — chaque archive est unique et ordonnée sans besoin de version sémantique.

### Secrets GitHub Actions requis

| Secret | Usage |
|---|---|
| `VPS_HOST` | IP ou domaine du VPS |
| `VPS_PORT` | Port SSH (optionnel, défaut 22) |
| `VPS_USER` | `githubdeploy` (utilisateur de déploiement dédié) |
| `VPS_SSH_KEY` | Clé privée ed25519 dédiée (pas la clé perso) |
| `VPS_KNOWN_HOSTS` | Résultat de `ssh-keyscan` depuis une machine de confiance |

L'empreinte du serveur est vérifiée via `known_hosts` (pas de `StrictHostKeyChecking=no`). Détection automatique de MITM, de réinst VPS, ou de typo dans `VPS_HOST`.

### Setup VPS one-shot

Voir README "Production deployment" pour la procédure complète : deux users (`prismel` runtime + `githubdeploy` deploy), groupe partagé `prismel-data`, sudoers restrictif (seulement `systemctl stop/start/restart prismel`), dépose de la clé publique, `ssh-keyscan` pour `VPS_KNOWN_HOSTS`.

### Modèle de permissions côté VPS

Deux users système séparés pour principle-of-least-privilege :

- `prismel` (`/usr/sbin/nologin`, system user, group `prismel-data`) : runtime du service systemd. Ne peut pas écrire son propre code, lit `.env` n'est plus applicable (config en DB).
- `githubdeploy` (`/bin/bash`, group `prismel-data`) : reçoit le SSH CI, owns `/opt/prismel/` (code), peut sudo `systemctl stop/start/restart prismel` uniquement.

Permissions filesystem cibles :

```
/opt/prismel/                          # githubdeploy:githubdeploy 750
├── backend/dist/                       # githubdeploy:githubdeploy (755/644)
├── node_modules/                       # githubdeploy:githubdeploy (755/644)
├── public/                             # githubdeploy:githubdeploy (755/644)
├── package.json, package-lock.json    # githubdeploy:githubdeploy 644
└── data/                               # prismel:prismel-data 770
    └── prismel.db                      # prismel:prismel-data 600 (runtime)
```

Le groupe `prismel-data` permet à `githubdeploy` d'écrire dans `data/` pendant la migration (qui tourne avant le start du service).`prismel` n'a aucun sudo.

Directives systemd hardening (dans `prismel.service`) :
- `NoNewPrivileges=true` : empêche SUID escalation
- `ProtectSystem=full` : `/usr`, `/boot`, `/etc` read-only
- `ProtectHome=true` : `/home` non accessible
- `PrivateTmp=true` : `/tmp` privé pour le service
- `ReadWritePaths=/opt/prismel/data` : whitelist explicite du seul répertoire writable

`Environment=PORT=3001` est défini inline dans le systemd unit. Aucun fichier `.env`, aucun `dotenv`, aucun `EnvironmentFile=`. Les credentials OVH sont saisis via la page Settings de l'UI après premier démarrage, stockés en base SQLite (table `settings`).

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

### Modules natifs (better-sqlite3)

`better_sqlite3.node` est compilé contre un ABI Node spécifique et lié contre une version de glibc. Le container CI (`node:24-bookworm` = Debian 12, glibc 2.36) et le VPS (Debian 12) sont identiques. `mise.toml` pinne Node 24.18.0 pour matcher le VPS. Toute divergence (autre distro, autre Node major) casserait le module natif au runtime.

Si la prod change de distro ou version Node :
1. Mettre à jour `mise.toml` (version Node)
2. Mettre à jour `container:` dans `.github/workflows/ci.yml` (distro + Node)
3. Regénérer `VPS_KNOWN_HOSTS` si la clé SSH serveur change

### Convention migrations

Les migrations sont générées par le développeur en local via `npm run db:generate`, puis committées dans `backend/src/db/migrations/`. La CI régénère en safety net (`continue-on-error: true`) mais ne commit pas. Si le schéma est modifié sans regeneration locale, le run CI ne cassera pas mais la prochaine migration sera vide.

## Self-update

Cet `AGENTS.md` doit être mis à jour à chaque changement significatif du projet : stack, conventions de code, structure, commandes de build/deploy, gotchas. Si un nouveau piège ESM ou de résolution est découvert, l'ajouter ici.