# AGENTS.md

Prismel : gestionnaire d'alias e-mail enrichi. Couche métier au-dessus des fournisseurs d'alias (OVH). Les métadonnées (service, tags, description) sont locales ; les fournisseurs gèrent l'exécution technique. README a la vue utilisateur, ce fichier a les instructions techniques pour agents.

## Stack

- Frontend : React, Vite, TypeScript, Tailwind CSS, React Router, shadcn/ui
- Backend : Express, TypeScript, Zod, Drizzle ORM, better-sqlite3 (module natif)
- Base : SQLite (fichier `data/prismel.db`)
- Node : 24.18.0 piné via `mise.toml` (source unique de vérité)

## Architecture

Séparation stricte : provider externe, service métier, repository local, API backend, frontend. Le modèle métier ne dépend jamais directement du modèle d'un fournisseur.

Contraintes :

- Toute interaction fournisseur passe par `backend/src/providers/`
- Toute logique métier passe par `backend/src/modules/`
- La génération d'alias passe par `modules/aliases/alias.generator.ts`
- Le frontend ne contacte jamais un fournisseur externe directement
- Les noms de fournisseurs ne sont jamais codés en dur dans l'orchestration (`alias.service.ts`)
- Le mapping domaine → fournisseur est en base (table `settings`, clé `domain_providers`), configurable via la page Settings. Format : `Record<string, string>` JSON.
- Les logs de sync ne mentionnent pas de fournisseur spécifique (éviter "pas géré par OVH")
- Les domaines sans fournisseur configuré sont ignorés silencieusement par la sync

## Structure

Monorepo npm workspaces (backend + frontend). Voir README pour le détail.

- `backend/src/` : `modules/aliases/`, `modules/settings/`, `providers/ovh/` + `registry.ts`, `db/` (schema + migrations), `types/`, `schemas/`, `validators/`, `middleware/`, `lib/`
- `frontend/src/` : `features/aliases/`, `features/settings/`, `components/`, `types/` (mirror des types backend), `lib/`
- `data/` : SQLite (gitignored)
- `.github/workflows/ci.yml` : pipeline CI

## OVH

Provider OVH implémenté via l'API de redirections email (pas les alias MX Plan). Endpoints :

- `GET /email/domain/{domain}/redirection` : liste IDs
- `GET /email/domain/{domain}/redirection/{id}` : détail `{id, from, to}`
- `POST /email/domain/{domain}/redirection` : crée `{from, to, localCopy}`
- `DELETE /email/domain/{domain}/redirection/{id}` : supprime

`from` = alias email, `to` = destination. `providerId` stocké est l'ID numérique OVH en string.

Ajouter un fournisseur : implémenter `ProviderClient` (interface dans `providers/registry.ts`), l'enregistrer dans le registry, configurer le mapping domaine dans l'UI.

## Sync

`POST /api/aliases/sync` répond en NDJSON. Une ligne = un objet JSON + `\n` :

```
{"type":"log","message":"┌─ Domain: tical.fr"}
{"type":"log","message":"│  [1/67] + NEW  #12345  alias@domain.fr → dest@mail.com"}
{"type":"result","data":{"new":67,"updated":0,"total":67,"errors":[],"logs":["..."]}}
```

Le frontend lit le flux avec `response.body.getReader()` et affiche les logs en temps réel.

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | `tsx watch` (backend) + `vite` (frontend) en parallèle |
| `npm run build` | Build tous les workspaces |
| `npm run db:generate` | Génère les migrations SQL (`-w @prismel/backend`) |
| `npm run db:push` | Pousse le schéma vers SQLite (`-w @prismel/backend`) |

Pas de script de build de déploiement local : la production passe par la CI.

## CI

Workflow : `.github/workflows/ci.yml`. Container : `node:24-bookworm` (Debian 12, glibc 2.36, identique au VPS).

- Job `test` (push master + PR) : checkout, `jdx/mise-action@v2` (lit `mise.toml`), `npm ci`, typecheck + lint + build
- Job `deploy` (push master only, après `test`) : build, génère migrations (safety net), assemble `deploy-build/` (backend/dist + public + node_modules prod + migrations), `tar czf prismel-<run-number>.tar.gz`, scp vers VPS, ssh (stop, backup, extract `--exclude="data"`, migrate, start, health check `/api/settings`), upload-artifact (90 jours, fallback rollback)

Le `run_number` GitHub est un build number monotone. Pas de version sémantique.

Secrets requis : `VPS_HOST`, `VPS_PORT` (optionnel), `VPS_USER` (`githubdeploy`), `VPS_SSH_KEY` (ed25519 dédiée), `VPS_KNOWN_HOSTS` (résultat de `ssh-keyscan`). Voir README pour le setup VPS one-shot (deux users `prismel` + `githubdeploy` + groupe `prismel-data`, systemd service avec directives hardening, `Environment=PORT=3001` inline, pas de `.env`).

## Gotchas ESM

Le backend a `"type": "module"` dans `package.json`. Node.js ESM exige les extensions `.js` explicites sur tous les imports relatifs.

- Écrire `import { config } from "./lib/config.js"` (pas `"./lib/config"`)
- TypeScript résolve `./lib/config.js` vers `./lib/config.ts` à la compilation
- Imports de répertoire : pointer vers l'index, `import { db } from "../../db/index.js"`

`backend/tsconfig.json` garde `moduleResolution: bundler` (pas `NodeNext`) car `better-sqlite3`, `express`, `cors` sont des modules CJS sans `exports` ESM et cassent sous `NodeNext`. Sans enforcement à la compilation, toute omission de `.js` compile mais échoue au runtime.

## Gotchas filesystem et modules natifs

- **Chemin DB** : `backend/src/db/index.ts` et `migrate.ts` résolvent le chemin via `import.meta.dirname` (pas `process.cwd()`). Remonte trois niveaux depuis `db/` (soit `src/db/` en dev via tsx, soit `dist/db/` en prod) pour atteindre `data/prismel.db` à la racine. Les scripts npm `-w @prismel/backend` changent le cwd à `backend/`, casserait un chemin relatif simple.

- **drizzle.config.ts** : chemins relatifs à `backend/` (cwd du workspace). Toujours `npm run db:* -w @prismel/backend`, jamais `npx drizzle-kit` depuis la racine.

- **better-sqlite3** : `better_sqlite3.node` est compilé contre un ABI Node spécifique + lié contre une version de glibc. Le container CI (`node:24-bookworm` = Debian 12, glibc 2.36) et le VPS (Debian 12) sont identiques. `mise.toml` pinne Node 24.18.0. Toute divergence (autre distro, autre Node major) casse le module au runtime. Si la prod change de distro ou version Node : mettre à jour `mise.toml` + `container:` dans `ci.yml` + regénérer `VPS_KNOWN_HOSTS` si la clé SSH serveur change.

- **Migrations** : générées par le développeur en local via `npm run db:generate`, puis committées dans `backend/src/db/migrations/`. La CI régénère en safety net (`continue-on-error: true`) mais ne commit pas. Si le schéma est modifié sans regeneration locale, le run CI passe mais la prochaine migration est vide.

- **Convention ESM** : angular le résolveur d'imports relatifs du backend exige `.js`, pas d'enforcement à la compilation. Revoir cette section si une nouvelle page de code échoue mystérieusement au runtime avec `ERR_MODULE_NOT_FOUND`.

## Self-update

Cet `AGENTS.md` doit être mis à jour à chaque changement significatif du projet : stack, conventions de code, structure, commandes de build/deploy, gotchas. Si un nouveau piège ESM ou de résolution est découvert, l'ajouter ici. Si une section devient obsolète, la supprimer plutôt que la commenter.