using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using VanDinh.API.Configuration;
using VanDinh.API.Data;
using VanDinh.API.Middleware;
using VanDinh.API.Repositories;
using VanDinh.API.Services;

var builder = WebApplication.CreateBuilder(args);

var corsOptions = builder.Configuration.GetSection("Cors").Get<CorsOptions>() ?? new CorsOptions();
var csrfOptions = builder.Configuration.GetSection("Csrf").Get<CsrfOptions>() ?? new CsrfOptions();
var sessionOptions = builder.Configuration.GetSection("Session").Get<AppSessionOptions>() ?? new AppSessionOptions();
var authCookieOptions = builder.Configuration.GetSection("AuthCookie").Get<AuthCookieOptions>() ?? new AuthCookieOptions();
var swaggerOptions = builder.Configuration.GetSection("Swagger").Get<SwaggerOptions>() ?? new SwaggerOptions();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sql =>
    {
        sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(30), null);
        sql.CommandTimeout(60);
    }));

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsOptions.PolicyName, policy =>
    {
        policy
            .WithOrigins(corsOptions.AllowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllersWithViews();
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = csrfOptions.HeaderName;
    options.Cookie.Name = csrfOptions.CookieName;
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    if (builder.Environment.IsProduction())
    {
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    }
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(swaggerOptions.Version, new OpenApiInfo
    {
        Title = swaggerOptions.Title,
        Version = swaggerOptions.Version,
        Description = swaggerOptions.Description,
        Contact = new OpenApiContact { Name = swaggerOptions.ContactName }
    });

    var xmlPath = Path.Combine(AppContext.BaseDirectory, "VanDinh.API.xml");
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
    }

    options.AddSecurityDefinition("CookieAuth", new OpenApiSecurityScheme
    {
        Description = "Authentication via cookie-based session. Use /api/auth/login to authenticate.",
        Name = "Cookie",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Cookie,
        Scheme = ".VanDinh.Auth"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "CookieAuth" } },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.Name = sessionOptions.CookieName;
    options.IdleTimeout = TimeSpan.FromHours(sessionOptions.IdleTimeoutHours);
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    if (builder.Environment.IsProduction())
    {
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    }
});

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = authCookieOptions.CookieName;
        options.Cookie.HttpOnly = true;
        if (builder.Environment.IsProduction())
        {
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        }
        else
        {
            options.Cookie.SameSite = SameSiteMode.Lax;
        }
        options.LoginPath = authCookieOptions.LoginPath;
        options.AccessDeniedPath = authCookieOptions.AccessDeniedPath;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<IUploadService, UploadService>();
builder.Services.AddScoped<IQrCodeService, QrCodeService>();
builder.Services.AddScoped<IHeritageService, HeritageService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAppRepository, EfAppRepository>();
builder.Services.AddHttpClient<IGoogleMapsCoordinateExtractor, GoogleMapsCoordinateExtractor>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await DbInitializer.InitializeAsync(db, hasher, builder.Configuration);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint($"/swagger/{swaggerOptions.Version}/swagger.json", $"{swaggerOptions.Title} {swaggerOptions.Version}");
        options.DocumentTitle = swaggerOptions.DocumentTitle;
        options.RoutePrefix = swaggerOptions.RoutePrefix;
    });
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors(corsOptions.PolicyName);
app.UseSession();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", application = "Van Dinh Digital Heritage Map", timestamp = DateTime.UtcNow }));

app.Run();
