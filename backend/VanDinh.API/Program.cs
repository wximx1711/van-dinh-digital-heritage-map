using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Threading.RateLimiting;
using VanDinh.API.Configuration;
using VanDinh.API.Data;
using VanDinh.API.Middleware;
using VanDinh.API.Repositories;
using VanDinh.API.Services;
using VanDinh.API.Services.MailMerge;

var builder = WebApplication.CreateBuilder(args);

var corsOptions = builder.Configuration.GetSection("Cors").Get<CorsOptions>() ?? new CorsOptions();
var csrfOptions = builder.Configuration.GetSection("Csrf").Get<CsrfOptions>() ?? new CsrfOptions();
var sessionOptions = builder.Configuration.GetSection("Session").Get<AppSessionOptions>() ?? new AppSessionOptions();
var authCookieOptions = builder.Configuration.GetSection("AuthCookie").Get<AuthCookieOptions>() ?? new AuthCookieOptions();
var swaggerOptions = builder.Configuration.GetSection("Swagger").Get<SwaggerOptions>() ?? new SwaggerOptions();
var mailMergeOptions = builder.Configuration.GetSection("MailMerge").Get<MailMergeOptions>() ?? new MailMergeOptions();

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
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<IUploadService, UploadService>();
builder.Services.AddScoped<IQrCodeService, QrCodeService>();
builder.Services.AddScoped<IHeritageService, HeritageService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEvaluationService, EvaluationService>();
builder.Services.AddScoped<IEvaluationReportExporter, EvaluationReportExporter>();
builder.Services.AddScoped<IAppRepository, EfAppRepository>();
builder.Services.AddScoped<IMailMergeJobRepository, EfMailMergeJobRepository>();
builder.Services.AddSingleton(mailMergeOptions);
builder.Services.AddSingleton<IMailMergePlaceholderExtractor, MailMergePlaceholderExtractor>();
builder.Services.AddSingleton<IExcelSheetReader, ExcelSheetReader>();
builder.Services.AddSingleton<IMailMergeFileNameGenerator, MailMergeFileNameGenerator>();
builder.Services.AddSingleton<IMailMergeDocumentGenerator, MailMergeDocumentGenerator>();
builder.Services.AddSingleton<IMailMergeJobRunner, MailMergeJobRunner>();
builder.Services.AddScoped<IMailMergeService, MailMergeService>();
builder.Services.AddHttpClient<IGoogleMapsCoordinateExtractor, GoogleMapsCoordinateExtractor>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await DbInitializer.InitializeAsync(db, hasher, builder.Configuration, app.Environment);
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

// Trust X-Forwarded-For / X-Forwarded-Proto from the reverse proxy (nginx, load balancer)
// so HttpsRedirection does not loop, Secure cookies are issued correctly, and the login
// rate limiter sees the real client IP instead of the proxy address.
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
    ForwardLimit = 2
});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors(corsOptions.PolicyName);
app.UseRateLimiter();
app.UseSession();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// The public evaluation kiosk is a dedicated SPA route (/evaluate?type=...&id=...).
// Serve the SPA shell for this path so QR codes work in production where the
// frontend is hosted behind the API. All other routes are untouched.
app.MapFallbackToFile("evaluate", "index.html");

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", application = "Van Dinh Digital Heritage Map", timestamp = DateTime.UtcNow }));

app.Run();
