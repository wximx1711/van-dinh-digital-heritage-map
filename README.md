
  # Van Dinh Digital Heritage Map

  This is a code bundle for Van Dinh Digital Heritage Map. The original project is available at https://www.figma.com/design/pH8mm29SpVOHYjt46Ac63P/Van-Dinh-Digital-Heritage-Map.

  ## Developer Setup

  After cloning:

  ```powershell
  .\scripts\install-hooks.ps1
  ```

  Git hooks are now installed. Database snapshots will automatically regenerate before every commit.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Database

  This project uses SQL Server. The database script is stored at `backend/database/VanDinhDigitalMap.sql`.

  To recreate the local database from scratch:

  ```powershell
  sqlcmd -S localhost -E -i backend\database\VanDinhDigitalMap.sql
  ```

  Note: this script drops the existing `VanDinhDigitalMap` database before creating it again.

  The script includes seed data and these app-ready views:

  - `vw_HeritageSites`: heritage records shaped like the frontend `HeritageSite` model.
  - `vw_HeritageImages`: image list for each heritage record.
  - `vw_IntangibleHeritage`: intangible heritage records shaped like the frontend `IntangibleHeritage` model.
  - `vw_MonthlyUpdates`: monthly statistics data.

  The ASP.NET API connection string is configured in `backend/VanDinh.API/appsettings.json` and `backend/VanDinh.API/appsettings.Development.json`.
  
