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

Deployment is fully automated via GitHub Actions. Every push to `master` triggers CI: tests run, and on success the archive is built (in a `node:24-bookworm` container matching the VPS glibc), scp'd to the server, extracted, migrations applied, and the systemd service restarted. A health check verifies the service is up; the run fails if the backend crashes.

### Build pipeline

The CI job produces a self-contained `prismel-<run-number>.tar.gz` (~7 MB) containing:
- Compiled `backend/dist/`
- Frontend static assets in `public/`
- Production `node_modules/` (native modules pre-compiled against the container's glibc 2.36 to match Debian 12)
- SQL migration files

The build number (`github.run_number`) is a monotonic integer; each push produces a unique, ordered archive. The artifact is also uploaded to GitHub Actions for 90 days as a fallback for rollback.

### VPS setup (one-time)

Two-system-user model: `githubdeploy` for CI deployment, `prismel` for the runtime service. The app runs with least privilege and cannot modify its own code.

```bash
# Shared group for the SQLite database (writeable by both the runtime and the migration step)
sudo groupadd prismel-data

# Runtime user: no login shell, no home (system user)
sudo useradd -r -s /usr/sbin/nologin -G prismel-data prismel

# Deploy user: can SSH in, owns /opt/prismel, can restart the service via sudo
sudo useradd -m -d /home/githubdeploy -s /bin/bash -G prismel-data githubdeploy
sudo install -d -o githubdeploy -g githubdeploy -m 700 /home/githubdeploy/.ssh

# authorized_keys: paste the public half of the dedicated deploy ed25519 key
sudo tee -a /home/githubdeploy/.ssh/authorized_keys <<'EOF'
ssh-ed25519 AAAA... prismel-deploy
EOF
sudo chown githubdeploy:githubdeploy /home/githubdeploy/.ssh/authorized_keys
sudo chmod 600 /home/githubdeploy/.ssh/authorized_keys

# Restrictive sudoers: only systemctl stop/start/restart prismel, no password
echo "githubdeploy ALL=(ALL) NOPASSWD: /bin/systemctl stop prismel, /bin/systemctl start prismel, /bin/systemctl restart prismel" | sudo tee /etc/sudoers.d/prismel-deploy
sudo chmod 440 /etc/sudoers.d/prismel-deploy

# Target directory with least-privilege ownership
sudo mkdir -p /opt/prismel/data
sudo chown -R githubdeploy:githubdeploy /opt/prismel
sudo chown prismel:prismel-data /opt/prismel/data
# /opt/prismel must be 755 (not 750) so the prismel runtime user can traverse
# into the directory and read the code (needs 'r' and 'x' for "others").
# prismel never writes here (no 'w' for others), only reads + executes.
sudo chmod 755 /opt/prismel
sudo chmod 770 /opt/prismel/data
```

Capture the VPS SSH fingerprint from a trusted machine (e.g. your laptop):

```bash
ssh-keyscan -H -p <port> <vps_host> 2>/dev/null > vps_known_hosts.txt
# Verify it contains one or two host key lines, no error
cat vps_known_hosts.txt
```

Then in GitHub repo settings, add these Actions secrets:

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS hostname or IP |
| `VPS_PORT` | SSH port (omit if 22) |
| `VPS_USER` | `githubdeploy` |
| `VPS_SSH_KEY` | Private ed25519 key (full PEM) |
| `VPS_KNOWN_HOSTS` | Contents of `vps_known_hosts.txt` |

### systemd service

`/etc/systemd/system/prismel.service`:

```ini
[Unit]
Description=Prismel Backend
After=network.target

[Service]
Type=simple
User=prismel
Group=prismel-data
WorkingDirectory=/opt/prismel
Environment=PORT=3001
ExecStart=/usr/bin/node backend/dist/index.js
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/opt/prismel/data

[Install]
WantedBy=multi-user.target
```

`WorkingDirectory=/opt/prismel` is required so the SQLite path (`data/prismel.db` resolved from `import.meta.dirname`'s three-levels-up resolution) and workspace `node_modules` hoisting both work. The hardcoded directives (`NoNewPrivileges`, `ProtectSystem`, `ProtectHome`, `PrivateTmp`, `ReadWritePaths`) restrict the service to read-only filesystem except for `data/`, block SUID escalation, and isolate `/tmp` and `/home`.

Configuration is entirely in the SQLite database (table `settings`) — OVH credentials, domain mappings, redirect targets. No `.env` file; the only env var is `PORT`, set inline in the systemd unit. OVH credentials are entered via the Settings page after the first start.

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

### Rollback

Each deploy produces `/tmp/prismel-backup-<timestamp>.tar.gz` on the VPS before extracting the new archive. To roll back:

```bash
# List available backups
ls -t /tmp/prismel-backup-*.tar.gz
# Restore one
sudo systemctl stop prismel
tar xzf /tmp/prismel-backup-<timestamp>.tar.gz -C /opt/prismel/
sudo systemctl start prismel
```

Alternatively, download the build N artifact from GitHub Actions, scp it to the VPS, and extract it manually.

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
