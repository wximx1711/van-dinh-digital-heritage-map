namespace VanDinh.API.Configuration;

public sealed class CorsOptions
{
    public string PolicyName { get; set; } = "Frontend";
    public string[] AllowedOrigins { get; set; } = [];
}

public sealed class AppSessionOptions
{
    public string CookieName { get; set; } = ".VanDinh.Session";
    public int IdleTimeoutHours { get; set; } = 8;
}

public sealed class AuthCookieOptions
{
    public string CookieName { get; set; } = ".VanDinh.Auth";
    public string LoginPath { get; set; } = "/api/auth/login";
    public string AccessDeniedPath { get; set; } = "/api/auth/forbidden";
}

public sealed class CsrfOptions
{
    public string HeaderName { get; set; } = "X-CSRF-TOKEN";
    public string CookieName { get; set; } = ".VanDinh.Csrf";
}

public sealed class SwaggerOptions
{
    public string Title { get; set; } = "Van Dinh Digital Heritage Map API";
    public string Version { get; set; } = "v1";
    public string Description { get; set; } = "";
    public string ContactName { get; set; } = "";
    public string DocumentTitle { get; set; } = "Van Dinh Digital Heritage Map API";
    public string RoutePrefix { get; set; } = "swagger";
}

public sealed class SeedAdminOptions
{
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
}
