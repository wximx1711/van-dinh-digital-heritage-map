using System.Text;

namespace VanDinh.API.Services;

public interface IQrCodeService
{
    string CreateSvg(string value);
}

public sealed class QrCodeService : IQrCodeService
{
    public string CreateSvg(string value)
    {
        const int cells = 21;
        const int cellSize = 8;
        var seed = value.Aggregate(17, (current, ch) => current * 31 + ch);
        var builder = new StringBuilder();
        builder.Append($"""<svg xmlns="http://www.w3.org/2000/svg" width="{cells * cellSize}" height="{cells * cellSize}" viewBox="0 0 {cells} {cells}">""");
        builder.Append("""<rect width="21" height="21" fill="white"/>""");
        for (var row = 0; row < cells; row++)
        {
            for (var col = 0; col < cells; col++)
            {
                var finder = (row < 7 && col < 7) || (row < 7 && col > 13) || (row > 13 && col < 7);
                var filled = finder || Math.Abs((row * 7 + col * 11 + seed) % 5) < 2;
                if (filled)
                {
                    builder.Append($"""<rect x="{col}" y="{row}" width="1" height="1" fill="#0F3D5E"/>""");
                }
            }
        }
        builder.Append("</svg>");
        return builder.ToString();
    }
}
