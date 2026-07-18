# Prismel

Enriched email alias manager. Adds business metadata (service name, tags, description) on top of email providers like OVH.

## Features

- Create, read, update, and delete email aliases with provider sync
- Quick alias creation: pick a domain, generate or type an alias, tag it, save it
- Search aliases by email, service name, tags, or description
- Sync local state with provider (OVH email redirections)
- Real-time sync logs via NDJSON streaming
- Automatic alias generation (word-based random names)
- Settings management for provider credentials

## Architecture

```
Provider (OVH API)
      ↓
  Service layer
      ↓
  Local repository (SQLite via Drizzle ORM)
      ↓
  REST API (Express)
      ↓
  Frontend (React + Vite)
```

Providers are isolated behind a registry pattern. Domain-to-provider mapping is stored in the database (table `settings`, configurable via the Settings page) — no hardcoded provider references in orchestration logic.

## Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React, Vite, TypeScript, Tailwind CSS, React Router, shadcn/ui |
| Backend   | Express, TypeScript, Zod, Drizzle ORM, better-sqlite3 |
| Shared    | TypeScript types, Zod schemas |
| Database  | SQLite |

## Getting started

```bash
npm install

# Set up OVH credentials
cp backend/.env.example backend/.env
# Edit backend/.env with your OVH API keys

# Initialize the database
npm run db:push

# Start both frontend and backend
npm run dev
```

Backend runs on `http://localhost:3001`. Frontend runs on `http://localhost:5173`.

### Scripts

| Script           | Description |
|------------------|-------------|
| `npm run dev`    | Start backend + frontend concurrently |
| `npm run build`  | Build all workspaces |
| `npm run lint`   | Lint all workspaces |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate`  | Apply migrations |
| `npm run db:push`     | Push schema to SQLite |

## Adding a provider

1. Create a directory under `backend/src/providers/<name>/`
2. Implement the `ProviderClient` interface from `backend/src/providers/registry.ts`
3. Register it in the `providers` object in `registry.ts`
4. Configure the domain-to-provider mapping in the Settings page (stored in the `settings` table)

## Production deployment

### Build the archive

```bash
bash scripts/deploy.sh
```

This produces a self-contained `prismel-<version>.tar.gz` (~7 MB) with:
- Compiled `backend/dist/`
- Frontend static assets in `public/`
- Production `node_modules/` (native modules pre-compiled for linux/x64)
- SQL migration files
- `.env.prod` template

Permissions are pre-set in the archive (directories 755, files 644). No internet access needed on the server.

### Deploy

```bash
sudo mkdir -p /opt/prismel
sudo tar xzf prismel-<version>.tar.gz -C /opt/prismel
sudo chown -R prismel:prismel /opt/prismel

sudo -u prismel cp /opt/prismel/.env.prod /opt/prismel/.env
sudo -u prismel vi /opt/prismel/.env          # set OVH keys

# Initialize database (first deploy only)
sudo -u prismel node /opt/prismel/backend/dist/db/migrate.js

# Start
sudo -u prismel node /opt/prismel/backend/dist/index.js
```

The systemd service should use `WorkingDirectory=/opt/prismel/` so the workspace `node_modules` hoisting (backend deps installed at the root) resolves correctly.

### Serve the frontend

The frontend static assets are in `public/`. Serve them with any web server. The API proxy is required so the SPA can reach backend endpoints under `/api/`.

**nginx example:**

```nginx
server {
    listen 80;
    server_name prismel.example.com;

    root /opt/prismel/public;
    try_files $uri $uri/ /index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database

The SQLite database lives at `data/prismel.db` (relative to the working directory, i.e. `/opt/prismel/data/prismel.db`). Ensure the `data/` directory exists and is writable by the service user. Back it up regularly — it contains all local metadata not stored in the provider.

## Project structure

```
prismel/
├── backend/
│   └── src/
│       ├── modules/
│       │   └── aliases/     # controller, service, repository, generator
│       ├── providers/
│       │   └── ovh/         # OVH API client and mapper
│       ├── db/              # Schema and migrations
│       ├── types/           # Shared interfaces (Alias, SyncResult, ...)
│       ├── schemas/         # Zod schemas (createAliasSchema, ...)
│       ├── validators/
│       ├── middleware/
│       └── lib/
├── frontend/
│   └── src/
│       ├── features/aliases/ # Alias list, sync, quick-create components
│       ├── features/settings/
│       ├── types/           # Mirror of backend types (Alias, SyncResult, ...)
│       └── components/       # Logo, ThemeToggle
```
