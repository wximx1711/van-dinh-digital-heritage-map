# Vân Đình Digital Heritage Map

Interactive web application for exploring and managing the cultural heritage of Vân Đình commune (Ứng Hòa, Hà Nội, Vietnam). Features an interactive Google Map with heritage site markers, detailed heritage profiles, media galleries, admin management, and a trip planner.

**Tech stack:** React 18 + TypeScript + Vite 6 + Tailwind CSS 4 (frontend), .NET 10 + ASP.NET Core Web API + EF Core (backend), SQL Server (database), Google Maps JavaScript API, Recharts (charts), Magick.NET (image processing), QRCoder (QR codes), Cookie Authentication.

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
| Google Maps API Key | With Maps JavaScript API enabled |

```powershell
git --version
dotnet --version        # Expect 10.x
node --version          # Expect 18.x or later
npm --version
```

---

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

Create a `.env` file in the project root:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Then:

```powershell
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
| `SeedAdmin:Username` / `Password` | `admin` / `Admin@123` | Development only |

**Frontend** (`.env` file — **do not commit**):

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JavaScript API key |

---

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
| Google Maps not loading | Create `.env` with `VITE_GOOGLE_MAPS_API_KEY` and ensure the API key has Maps JavaScript API enabled |
| Backend won't start (port in use) | Change port in `Properties/launchSettings.json` and update `vite.config.ts` proxy target |
| `Login failed` / connection issues | Edit `ConnectionStrings:DefaultConnection` in `appsettings.Development.json` — use SQL Auth or fix server name |
| SQL Server not found | Start the SQL Server service or use correct instance name (e.g. `.\SQLEXPRESS` or `(localdb)\MSSQLLocalDB`) |
| `dotnet` command not found | Install .NET SDK 10.0 from [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/10.0) |
| `npm install` fails | Upgrade Node.js to 18.x or later |
| Blank page / CORS error | Ensure backend runs on port 5109 and frontend on port 5173 |

---

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
│   │   ├── components/                   # 37 React components
│   │   ├── services/                     # API service layer
│   │   └── App.tsx                       # Root component
│   ├── core/types.ts                     # TypeScript type definitions
│   ├── data/labels.ts                    # i18n labels (VI / EN)
│   ├── presentation/hooks/               # Data-fetching hooks
│   └── styles/                           # CSS (Tailwind, globals, theme)
├── index.html                            # Vite entry HTML
├── package.json                          # Frontend dependencies
├── vite.config.ts                        # Vite config (proxy, plugins)
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
```
