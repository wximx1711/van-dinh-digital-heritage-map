# Phase 1 Architecture Report

Date: 2026-06-30

## Current Architecture

The project is a React/Vite frontend plus a single-project ASP.NET Core backend.

Frontend:
- Entry point: `src/main.tsx`, application shell in `src/app/App.tsx`.
- Most UI is component-local state and inline styles.
- Data is inconsistent:
  - Most pages import static data from `src/app/components/data.ts`.
  - `HomePage.tsx` imports hooks from `src/app/hooks/useHeritageData.ts`.
  - `src/app/hooks/useApi.ts` calls the mock service object in `src/app/services/api.ts`, but is not currently used by pages.
  - `src/app/services/api.ts` contains a second copy of heritage data and simulates backend calls.

Backend:
- Single ASP.NET Core Web API project: `backend/VanDinh.API`.
- Controllers, DTOs, domain models, EF Core context/configuration, repositories, services, middleware, and data initialization all live in the same project.
- Persistence uses EF Core SQL Server through `ApplicationDbContext`.
- Authentication uses ASP.NET Core cookie authentication and antiforgery.
- Some business logic is in services (`HeritageService`, `UserService`), but many controllers still manipulate repositories/entities directly.
- `IAppRepository` is a broad repository facade exposing materialized collections and CRUD methods for unrelated aggregate types.

## Compilation Status

Backend:
- `dotnet build backend\VanDinh.API\VanDinh.API.csproj` succeeds.
- Warnings:
  - EF Core obsolete `HasCheckConstraint` usage in configuration classes.
  - XML doc comments in `DTOs/ApiDtos.cs` are not attached to valid language elements.

Frontend:
- `npm run build` fails.
- Broken reference:
  - `src/app/hooks/useHeritageData.ts` imports `heritageSitesData`, `intangibleHeritageData`, `monthlyUpdates`, `typeLabels`, `classificationLabels`, and `statusLabels` from `src/app/services/api.ts`.
  - `src/app/services/api.ts` defines those values as private constants with different names for some values, not exports.

## Hardcoded Values

High-risk hardcoded values:
- `backend/VanDinh.API/Data/DbInitializer.cs`
  - Default admin password: `Admin@123`.
  - Default admin username/email.
  - Seed roles, categories, heritage sites, intangible heritage, about page, system settings, monthly updates.
  - Unsplash image URLs.
- `backend/VanDinh.API/Program.cs`
  - Fallback SQL Server connection string.
  - CORS origins.
  - cookie names, session timeout, Swagger metadata.
- `backend/VanDinh.API/appsettings*.json`
  - Local SQL Server connection string.
- `backend/VanDinh.API/Properties/launchSettings.json`
  - Localhost ports.
- `backend/VanDinh.API/Services/HeritageService.cs`
  - Google Maps URL template.
  - slug generation duplicated with `DbInitializer`.
- `backend/VanDinh.API/Controllers/AuthController.cs`
  - Swagger sample references default credentials.
- `src/app/services/api.ts` and `src/app/components/data.ts`
  - Full mock heritage datasets, labels, monthly updates, remote image URLs, coordinates.
- Many frontend components
  - Inline colors, text content, contact details, image URLs, map URL templates, and page metadata.

## Duplicate Code And Data

Major duplicates:
- Heritage data exists in at least three forms:
  - `src/app/components/data.ts`.
  - `src/app/services/api.ts`.
  - `backend/VanDinh.API/Data/DbInitializer.cs`.
- Backend seed data is duplicated again in `backend/VanDinh.API/Repositories/InMemoryAppRepository.cs`.
- `useHeritageData.ts` and `useApi.ts` implement overlapping hooks.
- `DbInitializer.Slugify` duplicates `HeritageService.Slugify`.
- Validation error extraction is repeated across controllers.
- Multiple controllers repeat direct repository lookup, DTO mapping, log calls, and success/error response patterns.

## Dead Code Candidates

Likely dead or replaceable:
- `backend/VanDinh.API/Repositories/InMemoryAppRepository.cs`
  - Not registered in DI. `EfAppRepository` is registered instead.
  - Contains stale seeded data and plaintext password hash placeholder.
- `src/app/hooks/useApi.ts`
  - Not imported by visible app pages.
- `src/app/services/api.ts`
  - Currently used indirectly only by `useApi.ts` and intended by the broken `useHeritageData.ts`.
  - Its mock data duplicates `components/data.ts`.
- `src/app/components/figma/ImageWithFallback.tsx`
  - No references found in the current import scan.
- Build outputs under `backend/VanDinh.API/bin` and `backend/VanDinh.API/obj`.
  - Generated artifacts should not be part of source architecture.

## Broken References

Confirmed:
- Frontend build fails because `useHeritageData.ts` imports non-exported members from `services/api.ts`.

Potential/architectural:
- Frontend currently does not consistently call backend API endpoints.
- Backend uses SQL Server, but the requested final target is Spring Boot 3 + MySQL.
- Current backend auth is cookie + antiforgery, but requested final target is Spring Security + JWT.
- Some frontend pages still read static component data, so backend changes will not affect most UI until a unified API client is introduced.

## Clean Architecture Gaps

Current backend boundaries:
- Presentation: Controllers exist but often include application decisions and repository access.
- Application: Partial service layer exists, but not complete and not isolated from infrastructure concerns.
- Domain: Entity models exist but include EF/data annotation concerns and are in the API project.
- Infrastructure: EF Core context/configuration/repository exist but are not isolated.

Required target separation:
- Presentation: controllers, request binding, auth filters, API responses.
- Application: use cases/services, DTOs, validation, mapping, interfaces.
- Domain: entities, value objects/enums, domain rules.
- Infrastructure: JPA/EF repositories during migration, persistence configuration, file/QR providers, security implementation.

## Migration Risks

- Removing demo/seed data conflicts with current app behavior because frontend and backend both rely on seeded/mock content.
- Replacing cookie auth with JWT will require frontend auth changes while preserving endpoint behavior.
- Moving to MySQL changes schema details such as identity generation, decimal precision, constraints, and text column types.
- API compatibility must be documented before Java migration: routes, request/response envelopes, pagination shape, auth requirements, and status codes.

## Phase 2 Starting Checklist

1. Fix the frontend build by resolving `useHeritageData.ts` versus `services/api.ts`.
2. Remove unused or duplicate hook/data paths while preserving the UI.
3. Externalize backend configuration values from `Program.cs`.
4. Remove unsafe default credentials and seeded demo data from runtime initialization.
5. Remove dead `InMemoryAppRepository` after confirming no DI/test usage.
6. Remove generated `bin`/`obj` source artifacts from the working tree if they are tracked.
7. Rebuild backend and frontend after each focused refactor.
