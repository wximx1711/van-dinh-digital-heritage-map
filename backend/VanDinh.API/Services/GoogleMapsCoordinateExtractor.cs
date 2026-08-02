using System.Globalization;
using System.Text.RegularExpressions;

namespace VanDinh.API.Services;

public sealed partial class GoogleMapsCoordinateExtractor(
    HttpClient httpClient,
    ILogger<GoogleMapsCoordinateExtractor> logger) : IGoogleMapsCoordinateExtractor
{
    private static readonly HashSet<string> ShortUrlHosts = new(StringComparer.OrdinalIgnoreCase)
    {
        "maps.app.goo.gl",
        "goo.gl"
    };

    public async Task<(double? Latitude, double? Longitude)> ExtractCoordinatesAsync(string? url, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(url))
            return (null, null);

        var resolvedUrl = url;

        if (IsShortUrl(url))
        {
            resolvedUrl = await ResolveShortUrlAsync(url, ct);
            if (resolvedUrl is null)
                throw new InvalidOperationException("Unable to resolve the shortened Google Maps URL.");
        }

        var (lat, lng) = ExtractFromUrl(resolvedUrl);
        if (lat.HasValue && lng.HasValue)
        {
            if (lat < -90d || lat > 90d || lng < -180d || lng > 180d)
                throw new InvalidOperationException("Extracted coordinates are out of valid range.");

            return (lat, lng);
        }

        throw new InvalidOperationException("Unable to extract coordinates from the provided Google Maps URL.");
    }

    private static bool IsShortUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            return false;

        return ShortUrlHosts.Contains(uri.Host);
    }

    private async Task<string?> ResolveShortUrlAsync(string url, CancellationToken ct)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);

            return response.RequestMessage?.RequestUri?.ToString();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to resolve shortened Google Maps URL: {Url}", url);
            return null;
        }
    }

    private static (double? Latitude, double? Longitude) ExtractFromUrl(string url)
    {
        var match = AtSignPattern().Match(url);
        if (match.Success && TryParseCoord(match.Groups[1].Value, out var lat1) && TryParseCoord(match.Groups[2].Value, out var lng1))
            return (lat1, lng1);

        match = QueryQPattern().Match(url);
        if (match.Success && TryParseCoord(match.Groups[1].Value, out var lat2) && TryParseCoord(match.Groups[2].Value, out var lng2))
            return (lat2, lng2);

        match = QueryLlPattern().Match(url);
        if (match.Success && TryParseCoord(match.Groups[1].Value, out var lat3) && TryParseCoord(match.Groups[2].Value, out var lng3))
            return (lat3, lng3);

        return (null, null);
    }

    private static bool TryParseCoord(string value, out double result) =>
        double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out result);

    [GeneratedRegex(@"@(-?\d+\.?\d*),(-?\d+\.?\d*)")]
    private static partial Regex AtSignPattern();

    [GeneratedRegex(@"[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)")]
    private static partial Regex QueryQPattern();

    [GeneratedRegex(@"[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)")]
    private static partial Regex QueryLlPattern();
}
