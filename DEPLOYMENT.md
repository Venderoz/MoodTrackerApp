# MoodTrackerApp Deployment Guide

## Overview

This project contains the MoodTrackerApp application stack:
- **Frontend:** React + Vite (Nginx)
- **Backend:** ASP.NET Core
- **Database:** MariaDB

The reverse proxy (Caddy) is managed **separately** in your homelab and should route traffic to this application.

## Quick Start

### 1. Prerequisites

- Docker & Docker Compose installed
- External Caddy reverse proxy running and accessible
- Caddy configured to route to `backend:8085` and `frontend:80`

### 2. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url> moodtracker
cd moodtracker

# Create .env file with your configuration
cp .env.example .env
```

### 3. Configure Environment

Edit `.env` to set your database password:

```bash
nano .env
```

Example configuration:
```
DB_PASSWORD=secure_password_here
DB_NAME=moodtracker_db
DB_PORT=3306
API_PORT=8085
```

### 4. Start Services

```bash
docker-compose up -d
```

Wait for all services to initialize (1-2 minutes on first run):

```bash
docker-compose logs -f
```

Press `Ctrl+C` when services are running.

### 5. Verify Services

```bash
# Check all services are running
docker-compose ps

# Check logs for any errors
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

## Service Details

### Database (MariaDB)
- **Internal URL:** `database:3306`
- **Port:** `${DB_PORT}` (default: 3306)
- **User:** `root`
- **Password:** `${DB_PASSWORD}` (from .env)
- **Database:** `${DB_NAME}` (default: moodtracker_db)

### Backend (ASP.NET Core)
- **Internal URL:** `backend:8085`
- **Port:** `${API_PORT}` (default: 8085)
- **Environment:** Connection string auto-configured
- **API Endpoints:** `/api/moodentry` (GET/POST)

### Frontend (React + Nginx)
- **Internal URL:** `frontend:80`
- **Port:** `3000:80` (exposed:internal)
- **Built with:** Vite
- **Served from:** `/usr/share/nginx/html`

## Network Architecture

```
External Caddy (separate container)
    ↓
Reverse Proxy Routes:
  /moodtracker/* → frontend:80
  /api/*        → backend:8085
    ↓
┌──────────────────────────────────┐
│   Docker Network (moodtracker)   │
├──────────────────────────────────┤
│  Frontend:80  ← Nginx/React      │
│  Backend:8085 ← ASP.NET API      │
│  Database:3306 ← MariaDB         │
└──────────────────────────────────┘
```

## Integrating with Your Homelab Caddy

Your existing Caddy instance should be configured to route traffic:

```
malinka.tail9f4e08.ts.net {
    handle_path /moodtracker/* {
        reverse_proxy frontend:80
    }

    handle /api/* {
        reverse_proxy backend:8085
    }
}
```

### Network Connection Options

Choose one method for Caddy to reach the containers:

#### Option 1: Same Docker Network (Recommended)
If Caddy is in a Docker container on the same network:

```bash
# Ensure Caddy is on moodtracker-network
docker network connect moodtracker-network caddy_container_name
```

#### Option 2: Docker Host Networking
If using host networking, use the host IP:

```
reverse_proxy <host-ip>:8085
reverse_proxy <host-ip>:80
```

#### Option 3: External Caddy (Non-Docker)
If Caddy runs on the host, use docker host gateway:

```
reverse_proxy host.docker.internal:8085
reverse_proxy host.docker.internal:80
```

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services

```bash
# Stop all (keeps data)
docker-compose down

# Stop and remove volumes (DELETES DATA!)
docker-compose down -v
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Backend Can't Connect to Database

```bash
# Check database is running
docker-compose logs database

# Verify connection string in logs
docker-compose logs backend | grep "Connection"

# Test database manually
docker-compose exec database mysql -u root -p${DB_PASSWORD} -D moodtracker_db -e "SHOW TABLES;"
```

### Frontend Shows "Connection Refused"

1. Check backend is running: `docker-compose ps backend`
2. Check API URL in frontend is `/api/moodentry` ✓
3. Check Caddy routes `/api/*` to `backend:8085`
4. Verify Caddy container can reach backend

### Caddy Can't Reach Containers

1. Ensure Caddy is on the same network: `docker network ls`
2. Verify container names are correct in Caddy config
3. Test connectivity: `docker-compose ps` shows container names
4. Try using host IP instead of container name

### Port Already in Use

Find and stop the conflicting service:

```bash
# Find what's using port 8085
sudo lsof -i :8085

# Find what's using port 80
sudo lsof -i :80
```

## API Integration

### Direct Access (for testing)

```bash
# Get all mood entries
curl http://localhost:8085/api/moodentry

# Create mood entry
curl -X POST http://localhost:8085/api/moodentry \
  -H "Content-Type: application/json" \
  -d '{"moodLevel": 4, "note": "Great day"}'
```

### Through Caddy (production)

```bash
# Get all mood entries
curl https://your-domain/api/moodentry

# Create mood entry
curl -X POST https://your-domain/api/moodentry \
  -H "Content-Type: application/json" \
  -d '{"moodLevel": 4, "note": "Great day"}'
```

## Performance on Raspberry Pi

### Optimization Tips

1. **Set memory limits** in docker-compose.yml to prevent OOM kills
2. **Use ARM-compatible images** (most default to arm64/armv7)
3. **Monitor disk space** - database and container storage can fill up
4. **Set up log rotation** to prevent logs from growing unbounded

### Recommended Limits

Add to `docker-compose.yml` services:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## Monitoring

### Container Stats

```bash
docker stats
```

### Database Size

```bash
docker-compose exec database du -sh /var/lib/mysql
```

### Log Size

```bash
docker system df
```

## Backup and Recovery

### Backup Database

```bash
docker-compose exec database mysqldump -u root -p${DB_PASSWORD} moodtracker_db > backup.sql
```

### Restore Database

```bash
docker-compose exec -T database mysql -u root -p${DB_PASSWORD} moodtracker_db < backup.sql
```

## Security Considerations

1. **Change default password** in `.env`
2. **Keep .env private** - never commit to git
3. **Use strong passwords** for database
4. **Enable firewall** - only expose ports through Caddy
5. **Keep containers updated** - run `docker-compose pull` regularly
6. **Monitor logs** for errors and suspicious activity

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Test API directly: `curl http://localhost:8085/api/moodentry`
4. Ensure .env is properly configured

