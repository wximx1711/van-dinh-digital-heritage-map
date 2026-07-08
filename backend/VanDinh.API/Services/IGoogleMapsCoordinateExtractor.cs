namespace VanDinh.API.Services;

public interface IGoogleMapsCoordinateExtractor
{
    Task<(double? Latitude, double? Longitude)> ExtractCoordinatesAsync(string? url, CancellationToken cancellationToken = default);
}
