using Microsoft.EntityFrameworkCore;
using VanDinh.API.Configuration;
using VanDinh.API.Data;
using VanDinh.API.Models;
using VanDinh.API.Services;

namespace VanDinh.API.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context, IPasswordHasher passwordHasher, IConfiguration configuration, IHostEnvironment environment)
    {
        await context.Database.MigrateAsync();

        // Seed Roles (idempotent)
        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { RoleName = "ADMIN" },
                new Role { RoleName = "MANAGER" }
            );
            await context.SaveChangesAsync();
        }

        // Seed default users (idempotent — by username).
        var seedAdmin = configuration.GetSection("SeedAdmin").Get<SeedAdminOptions>();
        var seedManager = configuration.GetSection("SeedManager").Get<SeedManagerOptions>();

        var adminConfigured = seedAdmin is { Username: not null } && !string.IsNullOrWhiteSpace(seedAdmin.Password);
        var managerConfigured = seedManager is { Username: not null } && !string.IsNullOrWhiteSpace(seedManager.Password);

        // On a fresh Production database the initial credentials MUST come from
        // configuration. Seeding the well-known dev fallbacks here would expose
        // a default admin account (admin/Admin@123 and manager/Manager@123).
        if (!context.Users.Any() && environment.IsProduction())
        {
            if (!adminConfigured)
                throw new InvalidOperationException(
                    "A fresh Production database requires the 'SeedAdmin' configuration section (Username/Password). " +
                    "Set it in appsettings.Production.json or via environment variables, e.g. SeedAdmin__Username / SeedAdmin__Password.");

            if (!managerConfigured)
                throw new InvalidOperationException(
                    "A fresh Production database requires the 'SeedManager' configuration section (Username/Password). " +
                    "Set it in appsettings.Production.json or via environment variables, e.g. SeedManager__Username / SeedManager__Password.");
        }

        var defaultUsers = new[]
        {
            new
            {
                Username = ValueOr(seedAdmin?.Username, "admin"),
                Password = ValueOr(seedAdmin?.Password, "Admin@123"),
                RoleName = "ADMIN",
                FullName = ValueOr(seedAdmin?.FullName, "System Administrator"),
                Email = ValueOr(seedAdmin?.Email, "admin@vandinh.gov.vn")
            },
            new
            {
                Username = ValueOr(seedManager?.Username, "manager"),
                Password = ValueOr(seedManager?.Password, "Manager@123"),
                RoleName = "MANAGER",
                FullName = ValueOr(seedManager?.FullName, "Heritage Manager"),
                Email = ValueOr(seedManager?.Email, "manager@vandinh.gov.vn")
            }
        };

        foreach (var u in defaultUsers)
        {
            if (!context.Users.Any(x => x.Username == u.Username))
            {
                var role = context.Roles.First(r => r.RoleName == u.RoleName);
                context.Users.Add(new User
                {
                    RoleId = role.RoleId,
                    Username = u.Username,
                    PasswordHash = passwordHasher.Hash(u.Password),
                    FullName = u.FullName,
                    Email = u.Email,
                    Status = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        foreach (var user in context.Users.Where(u => !u.PasswordHash.StartsWith("PBKDF2$")).ToList())
        {
            user.PasswordHash = passwordHasher.Hash(user.PasswordHash);
            user.UpdatedAt = DateTime.UtcNow;
        }
        await context.SaveChangesAsync();

        if (!context.HeritageCategories.Any())
        {
            context.HeritageCategories.AddRange(
                new HeritageCategory { Code = "dinh", NameVi = "Dinh", NameEn = "Communal House", IconUrl = "/icons/dinh.png" },
                new HeritageCategory { Code = "chua", NameVi = "Chua", NameEn = "Pagoda", IconUrl = "/icons/chua.png" },
                new HeritageCategory { Code = "den", NameVi = "Den", NameEn = "Temple", IconUrl = "/icons/den.png" },
                new HeritageCategory { Code = "mieu", NameVi = "Mieu", NameEn = "Shrine", IconUrl = "/icons/mieu.png" },
                new HeritageCategory { Code = "phu", NameVi = "Phu", NameEn = "Palace", IconUrl = "/icons/phu.png" },
                new HeritageCategory { Code = "quan", NameVi = "Quan", NameEn = "Taoist Temple", IconUrl = "/icons/quan.png" },
                new HeritageCategory { Code = "nhacu", NameVi = "Nha co", NameEn = "Ancient House", IconUrl = "/icons/nhacu.png" },
                new HeritageCategory { Code = "nhatho", NameVi = "Nha tho ho", NameEn = "Clan House", IconUrl = "/icons/nhatho.png" },
                new HeritageCategory { Code = "lang", NameVi = "Lang mo", NameEn = "Mausoleum", IconUrl = "/icons/lang.png" }
            );
            await context.SaveChangesAsync();
        }

        var adminUsername = seedAdmin?.Username ?? "admin";
        var adminUser = context.Users.FirstOrDefault(u => u.Username == adminUsername) ?? context.Users.First();

        await SeedMemorialSitesAsync(context, adminUser.UserId);

        if (!context.SystemSettings.Any())
        {
            context.SystemSettings.Add(new SystemSetting
            {
                WebsiteName = "Ban do so Xa Van Dinh",
                FooterText = "Ban do so Xa Van Dinh",
                ContactEmail = "contact@vandinh.vn",
                Phone = "0123456789",
                Address = "Xa Van Dinh, Thanh pho Ha Noi",
                UpdatedBy = adminUser.UserId,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        if (!context.AboutPages.Any())
        {
            context.AboutPages.Add(new AboutPage
            {
                TitleVi = "Giới thiệu xã Vân Đình",
                TitleEn = "About Van Dinh Commune",
                IntroductionVi = "Hệ thống Bản đồ số Di sản Văn hóa Vân Đình là dự án số hóa và bảo tồn di sản văn hóa của xã Vân Đình, huyện Ứng Hòa, thành phố Hà Nội.",
                IntroductionEn = "The Van Dinh Digital Heritage Map System is a project for digitizing and preserving cultural heritage of Van Dinh Commune, Ung Hoa District, Hanoi City.",
                MainContentVi = "Với tổng số hơn 10 di tích vật thể và 5 di sản phi vật thể được ghi nhận và số hóa, hệ thống cung cấp đầy đủ thông tin lịch sử, kiến trúc, tọa độ và hình ảnh của từng di sản.",
                MainContentEn = "With over 10 tangible heritage sites and 5 intangible heritage items documented and digitized, the system provides comprehensive information on history, architecture, coordinates, and images of each heritage site.",
                UpdatedBy = adminUser.UserId,
                UpdatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Backfill MediaFiles from existing heritage media records
        await BackfillMediaFilesAsync(context);
    }

    private static string ValueOr(string? value, string fallback)
        => string.IsNullOrWhiteSpace(value) ? fallback : value;

    /// <summary>
    /// Seeds well-documented revolution &amp; resistance memorial sites of Van Dinh /
    /// Ung Hoa. Content is grounded in the official monument records that ship with
    /// the database (VanDinhDigitalMap.sql heritage entries); seed runs only when the
    /// table is empty so existing data is never touched.
    /// </summary>
    private static async Task SeedMemorialSitesAsync(ApplicationDbContext context, long createdBy)
    {
        if (context.MemorialSites.Any()) return;

        var seeds = new (string NameVi, string NameEn, string Category, string Classification, string Status, string? OtherNames, string? AddressVi, string? AddressEn, decimal? Lat, decimal? Lon, string? EventDate, string? DescriptionVi, string? DescriptionEn, string? HistoryVi, string? HistoryEn, string? CommemorationVi, string? CommemorationEn, string? ImageUrl)[]
        {
            (
                "Đình Tảo Khê - Nơi phát lệnh khởi nghĩa giành chính quyền phủ Ứng Hòa",
                "Tao Khe Communal House - Where the Insurrection Order for Ung Hoa was Issued",
                "revolutionary_event", "unranked", "active", "Đình Tảo Khê",
                "Thôn Tảo Khê, xã Tảo Dương Văn, thị trấn Vân Đình, huyện Ứng Hòa, thành phố Hà Nội",
                "Tao Khe village, Tao Duong Van commune, Van Dinh town, Ung Hoa district, Hanoi city",
                20.70846150m, 105.77899610m, "17/08/1945",
                "Nơi ghi dấu sự kiện lịch sử quan trọng: chiều ngày 17/8/1945, tại ngôi đình này, đồng chí Đỗ Mười đã trực tiếp phát lệnh khởi nghĩa giành chính quyền phủ Ứng Hòa.",
                "The site of a significant historical event: on the afternoon of August 17, 1945, at this communal house, comrade Do Muoi directly issued the order for the uprising to seize power in Ung Hoa prefecture.",
                "Đình Tảo Khê là ngôi đình làng cổ của thôn Tảo Khê. Trong Cao trào tiền khởi nghĩa, đình là nơi tập hợp quần chúng, che giấu cán bộ và cất giấu tài liệu, vũ khí của lực lượng Việt Minh. Chiều 17/8/1945, đồng chí Đỗ Mười - đại diện Việt Minh - đã trực tiếp phát lệnh khởi nghĩa giành chính quyền phủ Ứng Hòa ngay tại sân đình, mở đầu cho thắng lợi của Cách mạng tháng Tám ở địa phương.",
                "Tao Khe communal house is the ancient village communal house of Tao Khe hamlet. During the pre-insurrection period it was where revolutionary cadres gathered and were sheltered, and where documents and weapons of the Viet Minh forces were hidden. On the afternoon of August 17, 1945, comrade Do Muoi - representing the Viet Minh - directly issued the order for the uprising to seize power in Ung Hoa prefecture in the commune house yard, opening the way for the August Revolution victory in the locality.",
                "Địa điểm được chính quyền và Nhân dân địa phương giữ gìn, hằng năm tổ chức các hoạt động dâng hương, tưởng niệm sự kiện lịch sử và giáo dục truyền thống cách mạng cho thế hệ trẻ.",
                "The site is preserved by the local authorities and people, with annual offerings and commemorative activities recalling the historic event and educating the young generation about revolutionary tradition.", 
                "/uploads/images/559e54f4d11540c1864ffa32c4ca16eb.jpg"
            ),
            (
                "Chùa Đông Dương - Cơ sở cách mạng nuôi giấu cán bộ cấp cao",
                "Dong Duong Pagoda - Revolutionary Base Sheltering Senior Cadres",
                "secret_base", "unranked", "active", "Chùa Đông Dương (Thiên Phúc Tự - Vĩnh Thọ Tự)",
                "Thôn Đông Dương, xã Tảo Dương Văn, huyện Ứng Hòa, thành phố Hà Nội",
                "Dong Duong village, Tao Duong Van commune, Ung Hoa district, Hanoi city",
                20.70736230m, 105.78912930m, "1945-1954",
                "Trong thời kỳ tiền khởi nghĩa và kháng chiến chống thực dân Pháp, chùa là cơ sở bí mật nuôi giấu và che chở an toàn cho nhiều cán bộ cách mạng cấp cao của Đảng và Nhà nước.",
                "During the pre-insurrection period and the resistance war against the French colonialists, the pagoda secretly sheltered and protected many senior revolutionary cadres of the Party and State.",
                "Làng Đông Dương và khu di tích Đình - Miếu - Chùa Đông Dương là một trong những địa điểm nằm trong hệ thống An Toàn Khu (ATK) bí mật của Xứ ủy Bắc Kỳ. Nơi đây từng nuôi dưỡng, che giấu nhiều cán bộ cách mạng tiền bối như các đồng chí Hoàng Quốc Việt, Hoàng Văn Thụ, Đỗ Mười, Văn Tiến Dũng, Nguyễn Văn Lộc. Tại gian Thượng điện của chùa vẫn còn lưu giữ dấu tích hầm bí mật nơi cán bộ cách mạng từng ẩn náu.",
                "Dong Duong village and the Dong Duong communal house - shrine - pagoda complex were among the secret safety zone (ATK) locations of the Bac Ky Party Committee. The site sheltered many senior revolutionary cadres such as comrade Hoang Quoc Viet, Hoang Van Thu, Do Muoi, Van Tien Dung and Nguyen Van Loc. In the Upper Sanctuary of the pagoda, traces of the secret tunnel where revolutionary cadres once hid are still preserved.",
                "Di tích cách mạng được giữ gìn, là nơi giáo dục truyền thống yêu nước và đón tiếp Nhân dân, du khách về tham quan, dâng hương.",
                "The revolutionary site is preserved, serving to educate about patriotic tradition and to welcome people and visitors for visits and offerings.", 
                "/uploads/images/8ab46954327d4f8a900f512ed8890ca3.jpg"
            ),
            (
                "Chùa Hậu Xá - Cơ sở nuôi giấu cán bộ cách mạng (Thái Bình Tự)",
                "Hau Xa Pagoda (Thai Binh Tu) - Revolutionary Cadre Shelter Base",
                "secret_base", "city", "active", "Chùa Hậu Xá (Thái Bình Tự)",
                "Thôn Hậu Xá, xã Cao Thành, huyện Ứng Hòa, thành phố Hà Nội",
                "Hau Xa village, Cao Thanh commune, Ung Hoa district, Hanoi city",
                20.72722690m, 105.78054630m, "1945-1954",
                "Thời kỳ chống Pháp, chùa là cơ sở nuôi giấu cán bộ cách mạng, bảo vệ an toàn cho các cuộc họp quan trọng của địa phương; dấu tích hầm bí mật vẫn còn lưu giữ.",
                "During the anti-French resistance, the pagoda sheltered revolutionary cadres and safely protected important local meetings; traces of the secret tunnel remain today.",
                "Trong những năm kháng chiến chống thực dân Pháp, chùa Hậu Xá trở thành cơ sở nuôi giấu cán bộ cách mạng, nơi diễn ra nhiều cuộc họp quan trọng của phong trào cách mạng địa phương. Phía bên phải tòa Tiền đường hiện vẫn còn lưu giữ nguyên vẹn dấu tích hầm bí mật - minh chứng cho sự mưu trí, dũng cảm của quân và dân nơi đây.",
                "During the resistance war against the French colonialists, Hau Xa pagoda became a base sheltering revolutionary cadres and hosting many important meetings of the local revolutionary movement. To the right of the Front Hall, the traces of the secret tunnel are still completely preserved - evidence of the intelligence and courage of the local soldiers and people.",
                "Dấu tích hầm bí mật tại chùa được bảo tồn nguyên vẹn, địa điểm là điểm tham quan, giáo dục truyền thống cách mạng cho các thế hệ.",
                "The secret tunnel traces at the pagoda are fully preserved; the site is a destination for visits and revolutionary-tradition education for all generations.", 
                "/uploads/images/e300e9d46a99489abe98f69ab9435013.jpg"
            ),
            (
                "Cụm Đình - Miếu - Chùa Cao Lãm - Nơi thành lập UBND cách mạng lâm thời phủ Đội Bình",
                "Cao Lam Complex - Where the Provisional Revolutionary Committee of Doi Binh Prefecture Was Founded",
                "revolutionary_event", "provincial", "active", "Cụm Đình - Miếu - Chùa Cao Lãm",
                "Xã Cao Thành, huyện Ứng Hòa, thành phố Hà Nội",
                "Cao Thanh commune, Ung Hoa district, Hanoi city",
                20.75896640m, 105.73630870m, "07/1945",
                "Tháng 7/1945, Chi bộ Việt Minh và Ủy ban Nhân dân cách mạng lâm thời phủ Đội Bình được thành lập ngay tại chùa; cụm di tích là nơi lực lượng cách mạng nổ súng giành chính quyền, cắm Quốc kỳ.",
                "In July 1945, the Viet Minh cell and the provisional revolutionary committee of Doi Binh prefecture were founded at the pagoda; the complex is where revolutionary forces opened fire to seize power and raised the national flag.",
                "Trong những năm Tiền khởi nghĩa, cụm Đình - Miếu - Chùa Cao Lãm là nơi lực lượng cách mạng đứng lên giành chính quyền, cắm Quốc kỳ, lập Ủy ban hành chính lâm thời và cử Chủ tịch lâm thời. Tháng 7/1945, Chi bộ Việt Minh và UBND cách mạng lâm thời phủ Đội Bình được thành lập ngay tại chùa. Năm 1950, di tích bị máy bay thực dân Pháp ném bom, bắn phá nhưng vẫn tiếp tục là cơ sở bí mật nuôi giấu cán bộ cách mạng.",
                "During the pre-insurrection years, the Cao Lam communal house - shrine - pagoda complex was where revolutionary forces rose up to seize power, raised the national flag, established the provisional administrative committee and appointed its provisional chairman. In July 1945, the Viet Minh cell and provisional revolutionary committee of Doi Binh prefecture were founded at the pagoda. In 1950, the site was bombed and heavily shelled by French colonial aircraft yet continued to serve as a secret base sheltering revolutionary cadres.",
                "Cụm di tích được xếp hạng Di tích lịch sử - văn hóa cấp tỉnh (Quyết định số 169/QĐ-UBND ngày 22/01/2008), là địa chỉ đỏ giáo dục truyền thống cách mạng của huyện Ứng Hòa.",
                "The complex is ranked as a Provincial-level historical and cultural monument (Decision No. 169/QD-UBND dated January 22, 2008) and serves as a red-address site for revolutionary tradition education in Ung Hoa district.", 
                "/uploads/images/b23911a7876d4bb3aa94951845935724.jpg"
            ),
            (
                "Đình Hậu Xá - Nơi tiễn đưa con em lên đường tòng quân đánh Mỹ",
                "Hau Xa Communal House - Where Children Left for the Fight against America",
                "memorial", "unranked", "active", "Đình Hậu Xá",
                "Thôn Hậu Xá, xã Cao Thành, huyện Ứng Hòa, thành phố Hà Nội",
                "Hau Xa village, Cao Thanh commune, Ung Hoa district, Hanoi city",
                20.72690620m, 105.78298500m, "1965-1975",
                "Trong kháng chiến chống Mỹ cứu nước, đình là nơi tiễn đưa những người con của làng Hậu Xá lên đường tòng quân; xã Phương Tú đã đóng góp lớn lao với 25 liệt sĩ và 06 Bà mẹ Việt Nam anh hùng.",
                "During the resistance war against America, the communal house was where the children of Hau Xa village were sent off to join the army; Phuong Tu commune made great sacrifices with 25 martyrs and 06 Vietnamese Heroic Mothers.",
                "Đình Hậu Xá là trung tâm sinh hoạt văn hóa, tín ngưỡng của làng Hậu Xá (xã Cao Thành, nay thuộc huyện Ứng Hòa). Trong kháng chiến chống Mỹ cứu nước, đình là nơi tiễn đưa những người con của làng lên đường tòng quân đánh Mỹ. Cùng với toàn xã, Hậu Xá đã có nhiều đóng góp lớn lao cho hai cuộc kháng chiến với 25 liệt sĩ và 06 Bà mẹ Việt Nam anh hùng.",
                "Hau Xa communal house is the cultural and religious center of Hau Xa village (Cao Thanh commune, now Ung Hoa district). During the anti-American resistance, it was where the village's children were sent off to join the army. Along with the whole commune, Hau Xa contributed greatly to both resistance wars with 25 martyrs and 06 Vietnamese Heroic Mothers.",
                "Đình vẫn là nơi tổ chức các hoạt động dâng hương tưởng niệm và giáo dục truyền thống yêu nước, đền ơn đáp nghĩa cho các gia đình liệt sĩ, gia đình có công với cách mạng.",
                "The communal house remains a venue for memorial offerings and patriotic education and for paying gratitude to families of martyrs and people with revolutionary merits.", 
                "/uploads/images/8fb6aa04ea7a41df9920ae0c8cf73412.jpg"
            ),
            (
                "Bến lội Hoàng Dương - Điểm trung chuyển vượt sông Đáy",
                "Hoang Duong Ferry Crossing - Day River Transit Point",
                "battlefield", "unranked", "active", "Bến lội Hoàng Dương",
                "Thôn Hoàng Dương, xã Sơn Công, huyện Ứng Hòa, thành phố Hà Nội",
                "Hoang Duong village, Son Cong commune, Ung Hoa district, Hanoi city",
                20.75848140m, 105.72085090m, "1946-1954",
                "Bến lội Hoàng Dương là điểm trung chuyển huyết mạch trên tuyến sông Đáy, nối vùng tự do và vùng tạm chiếm; nơi quân dân ta bí mật vượt sông, vận chuyển vũ khí, tài liệu, đưa đón cán bộ cách mạng.",
                "The Hoang Duong ferry crossing was a vital transit point on the Day River line linking liberated and temporarily occupied zones, where our soldiers and people secretly crossed, transported weapons and documents, and escorted revolutionary cadres.",
                "Trong kháng chiến chống thực dân Pháp, bến lội Hoàng Dương là điểm trung chuyển huyết mạch trên tuyến sông Đáy. Đây là nơi quân và dân ta bí mật bơi lội vượt sông, vận chuyển vũ khí, tài liệu và đưa đón cán bộ cách mạng an toàn - minh chứng cho tinh thần quả cảm, mưu trí của lực lượng du kích xã Sơn Công.",
                "During the resistance against the French colonialists, the Hoang Duong ferry crossing was a vital transit point on the Day River line. It was where our soldiers and people secretly swam across the river, transported weapons and documents, and safely escorted revolutionary cadres - proof of the courage and ingenuity of Son Cong commune's guerrilla forces.",
                "Địa điểm được Nhân dân và chính quyền địa phương giữ gìn, là di tích gắn với truyền thống du kích, góp phần giáo dục lịch sử kháng chiến cho thế hệ trẻ.",
                "The site is preserved by the local people and authorities as a monument tied to guerrilla tradition, contributing to educating the young generation about resistance history.",
                null
            )
        };

        var index = 1;
        var existingIds = context.MemorialSites.Select(i => i.PublicId).ToHashSet();
        var slugUsed = context.MemorialSites.Select(i => i.Slug).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var now = DateTime.UtcNow;

        foreach (var s in seeds)
        {
            string publicId;
            do
            {
                publicId = $"ms{index:D4}";
                index++;
            } while (existingIds.Contains(publicId));

            var slug = Slugify(s.NameVi);
            var uniqueSlug = slug;
            var suffix = 1;
            while (!slugUsed.Add(uniqueSlug))
            {
                uniqueSlug = $"{slug}-{suffix}";
                suffix++;
            }

            context.MemorialSites.Add(new MemorialSite
            {
                PublicId = publicId,
                Code = $"VĐHN-ĐLN-{index - 1:D3}",
                NameVi = s.NameVi,
                NameEn = s.NameEn,
                Slug = uniqueSlug,
                Category = s.Category,
                Classification = s.Classification,
                Status = s.Status,
                OtherNames = s.OtherNames,
                AddressVi = s.AddressVi,
                AddressEn = s.AddressEn,
                Latitude = s.Lat,
                Longitude = s.Lon,
                EventDate = s.EventDate,
                DescriptionVi = s.DescriptionVi,
                DescriptionEn = s.DescriptionEn,
                HistoryVi = s.HistoryVi,
                HistoryEn = s.HistoryEn,
                CommemorationVi = s.CommemorationVi,
                CommemorationEn = s.CommemorationEn,
                ImageUrl = s.ImageUrl,
                CreatedBy = createdBy,
                CreatedAt = now
            });
        }

        await context.SaveChangesAsync();
    }

    private static string Slugify(string value)
    {
        var chars = value.ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
        return string.Join('-', new string(chars).Split('-', StringSplitOptions.RemoveEmptyEntries));
    }

    private static async Task BackfillMediaFilesAsync(ApplicationDbContext context)
    {
        var existingUrls = context.MediaFiles.Select(mf => mf.Url).ToHashSet();

        var newMediaFiles = new List<MediaFile>();

        // Images
        foreach (var img in context.HeritageImages.AsNoTracking().ToList())
        {
            if (!existingUrls.Contains(img.ImageUrl))
            {
                newMediaFiles.Add(new MediaFile
                {
                    Url = img.ImageUrl,
                    FileName = Path.GetFileName(img.ImageUrl) ?? img.ImageUrl,
                    FileSize = 0,
                    MediaType = "image",
                    UploadedAt = img.UploadedAt
                });
                existingUrls.Add(img.ImageUrl);
            }
        }

        // Videos
        foreach (var vid in context.HeritageVideos.AsNoTracking().Where(v => v.VideoUrl != null).ToList())
        {
            if (!existingUrls.Contains(vid.VideoUrl!))
            {
                newMediaFiles.Add(new MediaFile
                {
                    Url = vid.VideoUrl!,
                    FileName = vid.Title ?? Path.GetFileName(vid.VideoUrl!) ?? vid.VideoUrl!,
                    FileSize = 0,
                    MediaType = "video",
                    UploadedAt = vid.UploadedAt
                });
                existingUrls.Add(vid.VideoUrl!);
            }
        }

        // Documents
        foreach (var doc in context.HeritageDocuments.AsNoTracking().Where(d => d.FileUrl != null).ToList())
        {
            if (!existingUrls.Contains(doc.FileUrl!))
            {
                newMediaFiles.Add(new MediaFile
                {
                    Url = doc.FileUrl!,
                    FileName = doc.FileName ?? Path.GetFileName(doc.FileUrl!) ?? doc.FileUrl!,
                    FileSize = doc.FileSize ?? 0,
                    MediaType = "document",
                    UploadedAt = doc.UploadedAt
                });
                existingUrls.Add(doc.FileUrl!);
            }
        }

        if (newMediaFiles.Count > 0)
        {
            context.MediaFiles.AddRange(newMediaFiles);
            await context.SaveChangesAsync();
        }
    }
}
