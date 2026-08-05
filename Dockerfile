# ─────────────────────────────────────────────────────────────
# Vân Đình Digital Heritage Map — Backend API image
# Multi-stage: build + publish the ASP.NET Core API.
# The frontend is served by a separate nginx image (frontend.Dockerfile).
# ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/VanDinh.API/VanDinh.API.csproj backend/VanDinh.API/
RUN dotnet restore backend/VanDinh.API/VanDinh.API.csproj

COPY backend/VanDinh.API/ backend/VanDinh.API/
RUN dotnet publish backend/VanDinh.API/VanDinh.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

# Persistent data directories (mounted as volumes in docker-compose).
# Uploaded media must never be baked into the image.
RUN mkdir -p /app/wwwroot/uploads/images \
    /app/wwwroot/uploads/videos \
    /app/wwwroot/uploads/documents \
    /app/App_Data/mail-merge

EXPOSE 8080
ENTRYPOINT ["dotnet", "VanDinh.API.dll"]
