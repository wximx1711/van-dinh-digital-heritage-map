using QRCoder;

namespace VanDinh.API.Services;

public interface IQrCodeService
{
    string CreateSvg(string value);
}

public sealed class QrCodeService : IQrCodeService
{
    public string CreateSvg(string value)
    {
        using var generator = new QRCodeGenerator();
        var qrData = generator.CreateQrCode(value, QRCodeGenerator.ECCLevel.Q);
        var svg = new SvgQRCode(qrData);
        return svg.GetGraphic(8, "#0F3D5E", "#FFFFFF", true, SvgQRCode.SizingMode.ViewBoxAttribute);
    }
}
