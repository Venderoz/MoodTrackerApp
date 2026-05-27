# MoodTrackerApp

A web application for tracking daily mood entries with a React frontend and ASP.NET Core backend, designed to run on Raspberry Pi with external Caddy reverse proxy.

## Architecture

- **Frontend:** React + Vite (served via Nginx)
- **Backend:** ASP.NET Core 10.0 (C#)
- **Database:** MariaDB
- **Reverse Proxy:** Caddy (external, managed separately)
- **Deployment:** Docker Compose

## Project Structure

```
.
├── frontend/           # React + Vite application
│   ├── src/           # Source code
│   ├── Dockerfile     # Frontend container configuration
│   └── package.json   # Dependencies
├── backend/           # ASP.NET Core application
│   ├── Controllers/   # API endpoints
│   ├── Models/        # Data models
│   ├── Data/          # Database context
│   ├── Dockerfile     # Backend container configuration
│   └── backend.csproj # Project file
├── docker-compose.yml # Container orchestration
├── .env.example       # Environment variables template
└── .env               # Environment variables (git-ignored)
```

## Prerequisites

- Docker & Docker Compose
- Caddy reverse proxy (running separately on your homelab)
- Raspberry Pi OS (or any Linux with Docker support)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MoodTrackerApp
```

### 2. Configure Environment Variables

Copy the example file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
DB_PASSWORD=your_secure_password
DB_NAME=moodtracker_db
DB_PORT=3306
API_PORT=8085
```

### 3. Configure External Caddy

Your external Caddy container should route traffic to the backend container:

```
handle /api/* {
    reverse_proxy backend:8085
}
```

Ensure the Caddy container is on the same network as this project's services, or use Docker host networking.

### 4. Build and Run

```bash
docker-compose up -d
```

Wait for all services to start (1-2 minutes on first run).

### 5. Verify Services

```bash
# Check services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

## Service Ports

- **Database (MariaDB):** `${DB_PORT}:3306` (default: 3306)
- **Backend API:** `${API_PORT}:8085` (default: 8085)
- **Frontend:** `3000:80` (exposed on port 3000, internal port 80)

## API Endpoints

The backend exposes the following endpoints. Access through your Caddy reverse proxy at `/api/*`:

### Get All Mood Entries

```bash
GET /api/moodentry
```

### Create a New Mood Entry

```bash
POST /api/moodentry
Content-Type: application/json

{
  "moodLevel": 4,
  "note": "Had a great day"
}
```

Response:
```json
{
  "id": 1,
  "moodLevel": 4,
  "note": "Had a great day",
  "createdAt": "2024-05-25T12:30:45"
}
```

## Database Schema

The application uses MariaDB with a `MoodEntry` table containing:
- `id` (int): Primary key
- `moodLevel` (int): 1-5 scale
- `note` (varchar): Optional comment
- `createdAt` (datetime): Timestamp of entry creation

## Architecture Overview

```
┌─────────────────────────────────────┐
│   External Caddy Reverse Proxy      │
│   (homelab, separate container)     │
└──────────────────┬──────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Docker Network     │
        │ (moodtracker-net)   │
        ├────────┬────────┬───┤
        │        │        │   │
    Frontend  Backend  Database
    (React)  (API)    (MariaDB)
    :80     :8085    :3306
```

## Troubleshooting

### Services won't start

Check logs:
```bash
docker-compose logs -f
```

### API connection issues through Caddy

1. Verify your external Caddy routes to `backend:8085`
2. Ensure Caddy container is on the same network
3. Test directly: `curl http://localhost:8085/api/moodentry`

### Database connection error

Verify `DB_PASSWORD` in `.env` matches `MYSQL_ROOT_PASSWORD` in `docker-compose.yml`.

### Frontend not loading

1. Check frontend service: `docker-compose logs frontend`
2. Verify Caddy routes `/moodtracker/*` to `frontend:80`
3. Ensure Nginx config is properly mounted

## Development

### Local Frontend Development

```bash
cd frontend
npm install -g pnpm
pnpm install
pnpm run dev
```

Frontend will be available at `http://localhost:5173`

### Local Backend Development

```bash
cd backend
dotnet restore
dotnet run
```

Backend will be available at `http://localhost:8085`

## Integration with Homelab Caddy

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

**Important:** Ensure the Caddy container can resolve the container names by:
1. Running Caddy on the same Docker network, OR
2. Using Docker host networking, OR
3. Using the host IP address instead of container names

## Notes

- The application expects to be behind a reverse proxy (Caddy)
- All containers communicate on the internal Docker network
- Database is persisted in `./database/` volume
- CORS is enabled for all origins in the backend (suitable for development)
- All services automatically restart on failure

