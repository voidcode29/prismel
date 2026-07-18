#!/usr/bin/env bash
# Prismel offline deployment archive (Linux x86_64)
# Produces a self-contained .tar.gz with built backend + frontend assets
# and pre-built node_modules (no internet needed on the target server).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${1:-$(node -p "require('$ROOT/backend/package.json').version")-$(date +%Y%m%d-%H%M%S)}"
ARCHIVE="prismel-${VERSION}.tar.gz"
BUILD_DIR="$ROOT/deploy-build"

echo "Building deploy archive: $ARCHIVE"

# ─── 1. Generate DB migration SQL files ──────────────────────────────────
echo "  → Generate database migrations..."
(cd "$ROOT/backend" && npx drizzle-kit generate 2>/dev/null || echo "  → (no changes)")

# ─── 2. Build all workspaces ─────────────────────────────────────────────
echo "  → Install dependencies + build..."
(cd "$ROOT" && npm ci && npm run build)

# ─── 3. Assemble deploy directory ────────────────────────────────────────
echo "  → Assemble deploy directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"/{backend/dist,public,data}

# Workspace root (for backend dependency hoisting)
cp "$ROOT/package.json"        "$BUILD_DIR/"
cp "$ROOT/package-lock.json"   "$BUILD_DIR/"

# Backend (compiled + config + migrations)
cp -r "$ROOT/backend/dist"/*   "$BUILD_DIR/backend/dist/"
cp    "$ROOT/backend/package.json"      "$BUILD_DIR/backend/"
cp    "$ROOT/backend/drizzle.config.ts" "$BUILD_DIR/backend/"

# Migration SQL files sit alongside the compiled migrate.js
if [ -d "$ROOT/backend/src/db/migrations" ]; then
  cp -r "$ROOT/backend/src/db/migrations" "$BUILD_DIR/backend/dist/db/"
fi

# Frontend (static SPA)
cp -r "$ROOT/frontend/dist"/*  "$BUILD_DIR/public/"

# ─── 4. Install production dependencies at workspace root ────────────────
echo "  → Install production dependencies (native modules for linux/x64)..."
(
  cd "$BUILD_DIR"
  npm ci --omit=dev
)

# ─── 5. .env.prod template ───────────────────────────────────────────────
cat > "$BUILD_DIR/.env.prod" << 'EOF'
PORT=3001
OVH_ENDPOINT=eu.api.ovh.com
OVH_APPLICATION_KEY=
OVH_APPLICATION_SECRET=
OVH_CONSUMER_KEY=
EOF

# ─── 6. Permissions (pre-set so extracted dir is ready to use) ───────────
echo "  → Set permissions..."
find "$BUILD_DIR" -type d -exec chmod 755 {} \;
find "$BUILD_DIR" -type f -exec chmod 644 {} \;
find "$BUILD_DIR/node_modules/.bin" -type f -exec chmod 755 {} \; 2>/dev/null || true
chmod 755 "$BUILD_DIR/data"

# ─── 7. Compress ─────────────────────────────────────────────────────────
echo "  → Compress..."
rm -f "$ROOT/$ARCHIVE"
(cd "$BUILD_DIR" && tar czf "$ROOT/$ARCHIVE" .)

# ─── 8. Cleanup ──────────────────────────────────────────────────────────
rm -rf "$BUILD_DIR"

echo ""
echo "  Archive: $ARCHIVE ($(du -h "$ROOT/$ARCHIVE" | cut -f1))"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Server deployment (offline, Linux x86_64):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  sudo mkdir -p /opt/prismel"
echo "  sudo tar xzf $ARCHIVE -C /opt/prismel"
echo "  sudo chown -R prismel:prismel /opt/prismel"
echo ""
echo "  sudo -u prismel cp /opt/prismel/.env.prod /opt/prismel/.env"
echo "  sudo -u prismel vi /opt/prismel/.env          # set OVH keys"
echo ""
echo "  # Initialize database (first deploy only)"
echo "  sudo -u prismel node /opt/prismel/backend/dist/db/migrate.js"
echo ""
echo "  # Start"
echo "  sudo -u prismel node /opt/prismel/backend/dist/index.js"
echo ""
echo "Note: all permissions are pre-set in the archive (dirs 755, files 644)."
echo "Run chown -R to match your service user."
