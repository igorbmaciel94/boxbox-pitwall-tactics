# BoxBox Pitwall Tactics - Runbook

## Architecture

```
Internet
  │
  ▼
Caddy (bloodwatch-caddy container, ports 80/443)
  │
  ├── boxbox.lighthousedev.uk
  │     ├── /api/*  → boxbox-api (127.0.0.1:18083)
  │     └── /*      → boxbox-web (127.0.0.1:18082)
  │
  └── (other sites: bloodwatch, cost-tracker)

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

## Initial Server Setup

Run these steps once on the production server:

```bash
# 1. Create project directory
mkdir -p /opt/boxbox/data/mongo

# 2. Copy production compose file
cd /opt/boxbox
# Copy docker-compose.prod.yml from the repo to /opt/boxbox/

# 3. Create .env from template
cp .env.example .env
# Edit .env and set a strong JWT_SECRET:
#   openssl rand -base64 32

# 4. Login to GHCR (private repo requires PAT)
docker login ghcr.io -u igorbmaciel94
# Enter a Personal Access Token with read:packages scope

# 5. Pull images and start
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# 6. Add Caddy site block
# Append contents of infra/Caddyfile.snippet to:
#   /opt/bloodwatch/compose/Caddyfile
# Then reload Caddy:
docker exec bloodwatch-caddy caddy reload --config /etc/caddy/Caddyfile
```

## GitHub Secrets

Configure these in **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `DEPLOY_HOST` | Server IP (e.g., `46.225.216.71`) |
| `DEPLOY_USER` | SSH user (e.g., `root`) |
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
ssh root@46.225.216.71
cd /opt/boxbox

# Use a specific commit SHA
export BOXBOX_IMAGE_TAG=<previous-commit-sha>
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
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
docker compose -f docker-compose.prod.yml exec mongo \
  mongodump --db=boxbox --archive=/tmp/boxbox-backup.archive

# Copy from container
docker cp boxbox-mongo:/tmp/boxbox-backup.archive ./backups/boxbox-$(date +%Y%m%d).archive
```

### Restore from backup

```bash
docker cp ./backups/boxbox-YYYYMMDD.archive boxbox-mongo:/tmp/restore.archive

docker compose -f docker-compose.prod.yml exec mongo \
  mongorestore --db=boxbox --archive=/tmp/restore.archive --drop
```

## Monitoring

### Health check

```bash
# From server
curl http://localhost:18083/health

# From internet
curl https://boxbox.lighthousedev.uk/api/health
```

### Logs

```bash
cd /opt/boxbox

# API logs
docker compose -f docker-compose.prod.yml logs -f api

# All services
docker compose -f docker-compose.prod.yml logs -f

# Caddy logs (from bloodwatch compose)
docker logs -f bloodwatch-caddy 2>&1 | grep boxbox
```

### Container status

```bash
docker compose -f docker-compose.prod.yml ps
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017` (set in compose) |
| `JWT_SECRET` | JWT signing key | **required** |
| `CORS_ORIGIN` | Allowed CORS origin | `https://boxbox.lighthousedev.uk` |
| `ASPNETCORE_ENVIRONMENT` | .NET environment | `Production` |
| `BOXBOX_IMAGE_TAG` | Docker image tag | `main` |
| `VITE_API_URL` | API URL (build-time) | `https://boxbox.lighthousedev.uk/api` |
