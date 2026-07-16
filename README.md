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

Providers are isolated behind a registry pattern. Domain-to-provider mapping is declared in shared constants — no hardcoded provider references in orchestration logic.

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
4. Add domain mappings in `shared/src/constants/domains.ts`

## Production deployment

### Build

```bash
npm run build
```

This compiles the backend TypeScript to `backend/dist/` and builds the frontend static assets to `frontend/dist/`.

### Run the backend

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with production values
node backend/dist/index.js
```

Set `NODE_ENV=production` and configure `PORT` via environment or `.env`.

### Serve the frontend

The built frontend (`frontend/dist/`) is a static SPA. Serve it with any web server:

**nginx example:**

```nginx
server {
    listen 80;
    server_name prismel.example.com;

    root /path/to/prismel/frontend/dist;
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

The API proxy is required so the frontend can reach backend endpoints under `/api/`.

### Database

The SQLite database is created at `backend/data/prismel.db` on first run. Ensure the `data/` directory exists and is writable by the backend process. Back up this file regularly — it contains all local metadata not stored in the provider.

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
│       ├── validators/
│       ├── middleware/
│       └── lib/
├── frontend/
│   └── src/
│       ├── features/aliases/ # Alias list, sync, quick-create components
│       ├── features/settings/
│       └── components/       # Logo, ThemeToggle
└── shared/
    └── src/
        ├── types/
        ├── schemas/
        └── constants/
```
