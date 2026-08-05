# Vân Đình Digital Heritage Map

Interactive web application for exploring and managing the cultural heritage of Vân Đình commune (Ứng Hòa, Hà Nội, Vietnam). Features an interactive map with heritage site markers, detailed heritage profiles, media galleries, admin management, and a trip planner.

**Tech stack:** React 18 + TypeScript + Vite 6 + Tailwind CSS 4 (frontend), .NET 10 + ASP.NET Core Web API + EF Core (backend), SQL Server (database), Leaflet + OpenStreetMap with OSRM for route planning, Recharts (charts), Magick.NET (image processing), QRCoder (QR codes), Cookie Authentication.

---

## Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 10.0 |
| Node.js | 18.x or later |
| npm | Ships with Node |
| SQL Server | 2019+ (Developer Edition free) |
| SQL Server Management Studio | Optional — for GUI restore |
| PowerShell | 5.1+ |

```powershell
git --version
dotnet --version        # Expect 10.x
node --version          # Expect 18.x or later
npm --version
```

> Note: mapping and routing use Leaflet + OpenStreetMap — **no API key is required**.

## Installation

```powershell
git clone <repository-url>
cd van-dinh-digital-heritage-map
npm install
```

`npm install` installs all frontend dependencies.

---

## Restore Database

### Method A — sqlcmd (Recommended)

```powershell
sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql
```

Creates the `VanDinhDigitalMap` database with all tables, foreign keys, indexes, constraints, views, and seed data.

### Method B — SQL Server Management Studio

1. Open SSMS and connect to `localhost`.
2. **File > Open > File** → select `backend/database/VanDinhDigitalMap.sql`.
3. Press **F5** (Execute).

---

## Backend Setup

```powershell
cd backend/VanDinh.API
dotnet restore
dotnet build
dotnet run
```

The API starts at `http://localhost:5109`. Verify by opening `http://localhost:5109/swagger` in your browser — you should see the Swagger UI with all endpoints.

---

## Frontend Setup

```powershell
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`. Open it in your browser.

The Vite dev server proxies `/api` and `/uploads` to the backend at `http://localhost:5109`.

---

## Configuration

**Backend** (`backend/VanDinh.API/appsettings.json` and `appsettings.Development.json`):

| Setting | Default | Notes |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | `Server=localhost;Database=VanDinhDigitalMap;Trusted_Connection=True;Encrypt=False` | Uses Windows Auth. Change for SQL Auth. |
| `Cors:AllowedOrigins` | `["http://localhost:5173"]` | Must match frontend URL |
| `SeedAdmin:Username` / `Password` | `admin` / `Admin@123` | Development fallback only |
| `SeedManager:Username` / `Password` | `manager` / `Manager@123` | Development fallback only |

> **Production:** a fresh database **refuses to start** without explicit `SeedAdmin` **and** `SeedManager` credentials (username + password) — the well-known dev defaults are never seeded in Production. Provide them via environment variables (`SeedAdmin__Username`, `SeedAdmin__Password`, `SeedManager__Username`, `SeedManager__Password`).

## Upload Folder

Uploaded files (images, PDFs) live at `backend/VanDinh.API/wwwroot/uploads/` and are tracked in Git. They exist after cloning or pulling. If missing, run `git pull` or `git lfs pull`.

---

## Daily Development Workflow

1. **Start the backend:**
   ```powershell
   cd backend/VanDinh.API
   dotnet run
   ```
2. **Start the frontend** (separate terminal):
   ```powershell
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## Database Export / Import

### Export (after schema or data changes)

```powershell
.\scripts\export-db.ps1
```

Generates `backend/database/VanDinhDigitalMap.sql` with schema, views, indexes, constraints, seed data, and identity values.

### Import (to sync with latest)

```powershell
sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql
```

### Auto-export on commit (optional)

```powershell
.\scripts\install-hooks.ps1
```

Installs a pre-commit hook that regenerates the SQL snapshot automatically before every commit.

---

## Git Workflow

```powershell
git pull                          # Get latest changes
# ... make changes ...
git add <files>
git commit -m "Message"           # Auto-exports DB if hook installed
git push
```

**Do not commit:** `node_modules/`, `dist/`, `.vscode/`, `.env`, `bin/`, `obj/`, `**/bin/`, `**/obj/` (all in `.gitignore`).

When the database changes:

```powershell
.\scripts\export-db.ps1
git add backend/database/VanDinhDigitalMap.sql
git commit -m "Update database snapshot"
git push
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Invalid object name 'HeritageImages'` | Restore the database: `sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql` |
| Map tiles not loading | The map uses the public OpenStreetMap tile server; a blocked/firewalled network can prevent tiles from loading |
| Backend won't start (port in use) | Change port in `Properties/launchSettings.json` and update `vite.config.ts` proxy target |
| `Login failed` / connection issues | Edit `ConnectionStrings:DefaultConnection` in `appsettings.Development.json` — use SQL Auth or fix server name |
| SQL Server not found | Start the SQL Server service or use correct instance name (e.g. `.\SQLEXPRESS` or `(localdb)\MSSQLLocalDB`) |
| `dotnet` command not found | Install .NET SDK 10.0 from [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/10.0) |
| `npm install` fails | Upgrade Node.js to 18.x or later |
| Blank page / CORS error | Ensure backend runs on port 5109 and frontend on port 5173 |

---

## Production Deployment

### Docker Compose (recommended)

A complete stack (SQL Server + API + nginx-served SPA) is provided:

```powershell
# 1. Configure secrets in .env (see .env.example)
# 2. Start the stack
docker compose up -d --build
```

The site is served at `http://localhost:8080` (nginx maps to the frontend;
`/api` and `/uploads` are reverse-proxied to the API container). Uploaded
media and generated mail-merge ZIPs are kept in named volumes
(`uploads`, `mailmerge-data`), and the database in `sqlserver-data`.

Required `.env` variables (the API **will not start** against a fresh database
without them):

| Variable | Description |
|---|---|
| `MSSQL_SA_PASSWORD` | Strong password for SQL Server `sa` |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | Initial administrator account |
| `SEED_MANAGER_USERNAME` / `SEED_MANAGER_PASSWORD` | Initial manager account |
| `FRONTEND_ORIGIN` | Public origin for the CORS allow-list (default `http://localhost:8080`) |

### Reverse proxy / TLS

`nginx.conf` handles SPA fallback and API proxying. Terminate TLS on your
edge (nginx host config, Cloudflare, or a load balancer) and forward
`X-Forwarded-Proto`; the API already trusts forwarded headers so the
HTTPS redirect and Secure cookies behave correctly.

### Render

`render.yaml` is a blueprint with two web services (API + nginx frontend).
SQL Server is not available as a Render managed service — point
`ConnectionStrings__DefaultConnection` at Azure SQL / Aiven / self-hosted
SQL Server.

### Notes

- The API performs EF migrations automatically at startup (`MigrateAsync`).
- `/api/health` returns `200 OK` for load-balancer health checks.
- Log in with the configured `SeedAdmin` account and change the password
  immediately after the first sign-in.

## Project Structure

```
├── backend/
│   ├── database/VanDinhDigitalMap.sql    # Full database snapshot
│   └── VanDinh.API/                      # ASP.NET Core Web API
│       ├── Controllers/                  # API endpoints (16 controllers)
│       ├── Data/                         # EF Core DbContext
│       ├── Models/                       # Domain models
│       ├── Repositories/                 # Data access layer
│       ├── Services/                     # Business logic layer
│       ├── wwwroot/uploads/              # Uploaded images & documents (Git-tracked)
│       ├── Program.cs                    # Entry point
│       └── appsettings.json              # Configuration
├── scripts/
│   ├── export-db.ps1                     # Database export script
│   └── install-hooks.ps1                 # Git hook installer
├── src/                                  # React frontend
│   ├── app/
│   │   ├── components/                   # React components
│   │   ├── services/                     # API service layer
│   │   └── App.tsx                       # Root component
│   ├── core/types.ts                     # TypeScript type definitions
│   ├── data/labels.ts                    # i18n labels (VI / EN)
│   ├── presentation/hooks/               # Data-fetching hooks
│   └── styles/                           # CSS (Tailwind, globals, theme)
├── index.html                            # Vite entry HTML
├── package.json                          # Frontend dependencies
├── vite.config.ts                        # Vite config (proxy, plugins)
├── Dockerfile                            # Backend API image
├── frontend.Dockerfile                   # Frontend (nginx) image
├── docker-compose.yml                    # Full production stack
├── nginx.conf                            # Production reverse-proxy config
├── render.yaml                           # Render.com blueprint
└── .gitignore
```

---

## Useful Commands

```powershell
# Frontend
npm install          # Install dependencies
npm run dev          # Start dev server on :5173
npm run build        # Production build

# Backend
dotnet restore       # Restore NuGet packages
dotnet build         # Build the API
dotnet run           # Start API on :5109

# Database
sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql   # Restore DB
.\scripts\export-db.ps1                                            # Export DB snapshot
.\scripts\install-hooks.ps1                                        # Install pre-commit hook

# Docker
docker compose up -d --build   # Start the full stack (SQL Server + API + nginx)
docker compose down            # Stop the stack (volumes are preserved)
```
