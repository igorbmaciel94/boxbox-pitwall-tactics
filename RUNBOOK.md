# BoxBox Pitwall Tactics - Runbook

## Architecture

```
Internet
  │
  ▼
Caddy (shared reverse proxy, ports 80/443)
  │
  ├── <APP_DOMAIN>
  │     ├── /api/*  → boxbox-api (127.0.0.1:18083)
  │     └── /*      → boxbox-web (127.0.0.1:18082)
  │
  └── (other hosted sites)

boxbox-web (nginx, serves static Vite build)
boxbox-api (.NET 9, port 8080 internal)
boxbox-mongo (MongoDB 7, internal only)
```

## Local Development Setup

```bash
# Prerequisites: Node.js >= 20, Docker

# Install dependencies
npm install

# Start all services (dev mode)
docker compose up -d

# Start web dev server
npm run dev:web

# Services:
# - Web:           http://localhost:5173
# - API:           http://localhost:5001
# - MongoDB:       localhost:27017
# - Mongo Express: http://localhost:8081
```

## Server Directory Structure

```
/opt/boxbox/
├── docker-compose.yml    # copied from deploy/docker-compose.yml
├── .env                  # created from deploy/.env.example
└── data/
    └── mongo/            # MongoDB persistent data
```

## Initial Server Setup

Run these steps once on the production server:

```bash
# 1. Create project directory
mkdir -p /opt/boxbox/data/mongo
cd /opt/boxbox

# 2. Copy deploy files from repo (or download from GitHub)
# Option A: curl from GitHub (private repo needs PAT)
curl -H "Authorization: token <PAT>" -o docker-compose.yml \
  https://raw.githubusercontent.com/igorbmaciel94/boxbox-pitwall-tactics/main/deploy/docker-compose.yml

curl -H "Authorization: token <PAT>" -o .env.example \
  https://raw.githubusercontent.com/igorbmaciel94/boxbox-pitwall-tactics/main/deploy/.env.example

# Option B: copy from local machine
# scp deploy/docker-compose.yml <DEPLOY_USER>@<DEPLOY_HOST>:/opt/boxbox/docker-compose.yml
# scp deploy/.env.example <DEPLOY_USER>@<DEPLOY_HOST>:/opt/boxbox/.env.example

# 3. Create .env from template
cp .env.example .env
# Edit .env and set a strong JWT_SECRET:
#   openssl rand -base64 32

# 4. Login to GHCR (private repo requires PAT)
docker login ghcr.io -u igorbmaciel94
# Enter a Personal Access Token with read:packages scope

# 5. Pull images and start
docker compose pull
docker compose up -d

# 6. Add Caddy site block
# Append contents of deploy/Caddyfile.snippet to:
#   <CADDY_COMPOSE_DIR>/Caddyfile
# Then reload Caddy:
docker exec <CADDY_CONTAINER> caddy reload --config /etc/caddy/Caddyfile
```

## GitHub Secrets

Configure these in **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `DEPLOY_HOST` | Server hostname or IP |
| `DEPLOY_USER` | SSH user |
| `DEPLOY_SSH_KEY` | Private SSH key for deployment |
| `JWT_SECRET_PROD` | JWT signing secret (min 32 chars) |

## GHCR Private Repo Setup

Since this repo is private, Docker images on GHCR are also private.

1. Create a PAT at https://github.com/settings/tokens with `read:packages` scope
2. On the server: `docker login ghcr.io -u igorbmaciel94 -p <PAT>`
3. Ensure package visibility matches the repo (Settings > Packages)

The CI workflow uses `GITHUB_TOKEN` which has automatic write access to GHCR.

## Deploy

1. Go to **Actions > Deploy to Production** on GitHub
2. Click **Run workflow**
3. Optionally check "Skip tests" for emergency deploys
4. Monitor the workflow run for success

The workflow:
- Runs tests (frontend + backend)
- SSHs into the server
- Writes `.env` from secrets
- Pulls latest images from GHCR
- Restarts containers
- Verifies health check

## Rollback

### Quick rollback (previous image)

```bash
ssh <DEPLOY_USER>@<DEPLOY_HOST>
cd /opt/boxbox

# Use a specific commit SHA
export BOXBOX_IMAGE_TAG=<previous-commit-sha>
docker compose pull
docker compose up -d
```

### Check available image tags

```bash
# List tags on GHCR (requires gh CLI)
gh api /user/packages/container/boxbox-api/versions --jq '.[].metadata.container.tags[]'
```

## MongoDB Backup

### Create backup

```bash
cd /opt/boxbox

# Dump to archive
docker compose exec mongo \
  mongodump --db=boxbox --archive=/tmp/boxbox-backup.archive

# Copy from container
docker cp boxbox-mongo:/tmp/boxbox-backup.archive ./backups/boxbox-$(date +%Y%m%d).archive
```

### Restore from backup

```bash
docker cp ./backups/boxbox-YYYYMMDD.archive boxbox-mongo:/tmp/restore.archive

docker compose exec mongo \
  mongorestore --db=boxbox --archive=/tmp/restore.archive --drop
```

## Monitoring

### Health check

```bash
# From server
curl http://localhost:18083/health

# From internet
curl https://<APP_DOMAIN>/api/health
```

### Logs

```bash
cd /opt/boxbox

# API logs
docker compose logs -f api

# All services
docker compose logs -f

# Caddy logs (from shared reverse proxy)
docker logs -f <CADDY_CONTAINER> 2>&1 | grep boxbox
```

### Container status

```bash
docker compose ps
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017` (set in compose) |
| `JWT_SECRET` | JWT signing key | **required** |
| `CORS_ORIGIN` | Allowed CORS origin | `https://<APP_DOMAIN>` |
| `ASPNETCORE_ENVIRONMENT` | .NET environment | `Production` |
| `BOXBOX_IMAGE_TAG` | Docker image tag | `main` |
| `VITE_API_URL` | API URL (build-time) | `https://<APP_DOMAIN>/api` |
