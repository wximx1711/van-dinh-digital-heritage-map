import { useState } from 'react';
import { Printer, Image as ImageIcon, FileSpreadsheet, X, Download, CheckCircle, FileText } from 'lucide-react';
import type { HeritageSite } from '../../core/types';
import { typeLabels, classificationLabels, statusLabels } from '../../data/labels';

interface ExportMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  heritageSites: HeritageSite[];
  filteredSites: HeritageSite[];
  lang: 'vi' | 'en';
}

export function ExportMapModal({
  isOpen,
  onClose,
  heritageSites,
  filteredSites,
  lang,
}: ExportMapModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'filtered'>('filtered');
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetSites = activeTab === 'all' ? heritageSites : filteredSites;

  // 1. IN / XUẤT FILE CỨNG PDF KHỔ A4 CHUẨN VĂN BẢN HÀNH CHÍNH
  const handlePrintA4 = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const nationalCount = targetSites.filter(s => s.classification === 'national').length;
    const cityCount = targetSites.filter(s => s.classification === 'city').length;
    const unrankedCount = targetSites.filter(s => s.classification === 'unranked').length;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      alert('Vui lòng cho phép mở cửa sổ popup để in báo cáo!');
      return;
    }

    const rowsHtml = targetSites.map((site, index) => {
      const typeName = typeLabels[site.type]?.[lang] || site.type;
      const clsName = classificationLabels[site.classification]?.[lang] || site.classification;
      const statusName = statusLabels[site.status]?.[lang] || site.status;
      const coords = site.lat && site.lon ? `${site.lat.toFixed(6)}, ${site.lon.toFixed(6)}` : 'Chưa có';

      return `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td style="text-align: center; font-weight: 600;">${site.code || site.id}</td>
          <td style="font-weight: 600;">${site.nameVi}</td>
          <td style="text-align: center;">${typeName}</td>
          <td style="text-align: center;">${clsName}</td>
          <td>${site.addressVi || 'Xã Vân Đình'}</td>
          <td style="text-align: center; font-size: 10pt;">${coords}</td>
          <td style="text-align: center;">${statusName}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>Báo cáo Bản đồ Di sản Văn hóa xã Vân Đình</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 11.5pt;
            color: #000;
            line-height: 1.4;
            background: #fff;
            margin: 0;
            padding: 10px;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .header-table td {
            vertical-align: top;
            padding: 0;
          }
          .gov-title {
            text-align: center;
          }
          .gov-title strong {
            display: block;
            font-size: 11pt;
          }
          .gov-sub {
            display: block;
            font-size: 10pt;
            font-weight: 600;
          }
          .divider {
            width: 120px;
            height: 1px;
            background: #000;
            margin: 4px auto 8px auto;
          }
          .date-line {
            font-style: italic;
            font-size: 10.5pt;
            text-align: center;
            margin-top: 4px;
          }
          .main-title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 20px 0 6px 0;
            color: #0F3D5E;
          }
          .sub-title {
            text-align: center;
            font-size: 11pt;
            font-style: italic;
            margin-bottom: 18px;
          }
          .stat-box {
            border: 1px solid #333;
            padding: 8px 14px;
            margin-bottom: 16px;
            background-color: #fcfcfc;
            border-radius: 4px;
            font-size: 11pt;
          }
          .stat-box strong {
            color: #0F3D5E;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 25px;
          }
          .data-table th, .data-table td {
            border: 1px solid #333;
            padding: 6px 6px;
            font-size: 10.5pt;
          }
          .data-table th {
            background-color: #f0f4f8;
            font-weight: bold;
            text-align: center;
          }
          .sign-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            page-break-inside: avoid;
          }
          .sign-table td {
            text-align: center;
            vertical-align: top;
            width: 50%;
            font-size: 11.5pt;
          }
          .sign-space {
            height: 70px;
          }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 45%; text-align: center;">
              <strong>ỦY BAN NHÂN DÂN XÃ VÂN ĐÌNH</strong>
              <span class="gov-sub">BAN QUẢN LÝ DI TÍCH LỊCH SỬ</span>
              <div class="divider"></div>
              <div style="font-size: 10pt;">Số: ...../BC-BQLDT</div>
            </td>
            <td style="width: 55%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong>
              <strong style="font-size: 11pt;">Độc lập - Tự do - Hạnh phúc</strong>
              <div class="divider" style="width: 160px;"></div>
              <div class="date-line">Vân Đình, ngày ${day} tháng ${month} năm ${year}</div>
            </td>
          </tr>
        </table>

        <div class="main-title">BÁO CÁO DANH MỤC & TỌA ĐỘ DI SẢN VĂN HÓA SỐ</div>
        <div class="sub-title">(Hệ thống Cơ sở dữ liệu và Bản đồ số di sản xã Vân Đình, TP. Hà Nội)</div>

        <div class="stat-box">
          <div><strong>I. TỔNG HỢP SỐ LIỆU ĐANG XUẤT:</strong></div>
          <div style="margin-top: 4px; display: flex; gap: 20px;">
            <span>• Tổng số di tích: <strong>${targetSites.length}</strong></span>
            <span>• Cấp Quốc gia: <strong>${nationalCount}</strong></span>
            <span>• Cấp Thành phố: <strong>${cityCount}</strong></span>
            <span>• Chưa xếp hạng: <strong>${unrankedCount}</strong></span>
          </div>
        </div>

        <div><strong>II. DANH MỤC CHI TIẾT CÁC ĐIỂM DI TÍCH TRÊN ĐỊA BÀN:</strong></div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35px;">STT</th>
              <th style="width: 80px;">Mã số</th>
              <th>Tên di tích</th>
              <th style="width: 70px;">Loại hình</th>
              <th style="width: 90px;">Cấp xếp hạng</th>
              <th>Thôn / Vị trí</th>
              <th style="width: 130px;">Tọa độ GPS</th>
              <th style="width: 80px;">Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <table class="sign-table">
          <tr>
            <td>
              <strong>NGƯỜI LẬP BIỂU</strong><br/>
              <em>(Ký và ghi rõ họ tên)</em>
              <div class="sign-space"></div>
            </td>
            <td>
              <strong>TM. ỦY BAN NHÂN DÂN XÃ VÂN ĐÌNH</strong><br/>
              <strong>CHỦ TỊCH / TRƯỞNG BAN QUẢN LÝ</strong><br/>
              <em>(Ký tên và đóng dấu)</em>
              <div class="sign-space"></div>
            </td>
          </tr>
        </table>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // 2. XUẤT FILE BẢNG TÍNH EXCEL (.XLS CHUẨN TỪNG CỘT RIÊNG BIỆT MỞ ĐẸP TRÊN WPS VÀ EXCEL)
  const handleExportExcel = () => {
    const rowsHtml = targetSites.map((site, index) => {
      const typeName = typeLabels[site.type]?.[lang] || site.type;
      const clsName = classificationLabels[site.classification]?.[lang] || site.classification;
      const statusName = statusLabels[site.status]?.[lang] || site.status;

      return `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td style="text-align: center; mso-number-format:'\\@'; font-weight: bold;">${site.code || site.id}</td>
          <td style="font-weight: 600;">${site.nameVi || ''}</td>
          <td>${site.nameEn || ''}</td>
          <td style="text-align: center;">${typeName}</td>
          <td style="text-align: center;">${clsName}</td>
          <td style="text-align: center;">${statusName}</td>
          <td>${site.addressVi || ''}</td>
          <td style="text-align: center; mso-number-format:'0.000000';">${site.lat ?? ''}</td>
          <td style="text-align: center; mso-number-format:'0.000000';">${site.lon ?? ''}</td>
          <td style="text-align: center;">${site.yearBuilt || ''}</td>
          <td>${site.guardian || ''}</td>
          <td>${site.googleMapUrl || ''}</td>
        </tr>
      `;
    }).join('');

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Danh sách di tích</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; }
          th { background-color: #0F3D5E; color: #ffffff; font-weight: bold; border: 1px solid #475569; padding: 8px 10px; text-align: center; }
          td { border: 1px solid #cbd5e1; padding: 6px 10px; vertical-align: middle; }
          .title-row { font-size: 15pt; font-weight: bold; color: #0F3D5E; text-align: center; height: 35px; border: none; }
          .sub-row { font-size: 11pt; font-style: italic; color: #475569; text-align: center; height: 24px; border: none; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="13" class="title-row">DANH MỤC DI SẢN VĂN HÓA XÃ VÂN ĐÌNH</td>
          </tr>
          <tr>
            <td colspan="13" class="sub-row">Hệ thống Bản đồ số Di sản — Tổng số: ${targetSites.length} di tích (Ngày xuất: ${new Date().toLocaleDateString('vi-VN')})</td>
          </tr>
          <tr><td colspan="13" style="border: none; height: 10px;"></td></tr>
          <thead>
            <tr>
              <th style="width: 50px;">STT</th>
              <th style="width: 120px;">Mã di tích</th>
              <th style="width: 250px;">Tên di tích</th>
              <th style="width: 200px;">Tên tiếng Anh</th>
              <th style="width: 100px;">Loại hình</th>
              <th style="width: 130px;">Cấp xếp hạng</th>
              <th style="width: 120px;">Tình trạng</th>
              <th style="width: 260px;">Thôn / Địa chỉ</th>
              <th style="width: 120px;">Vĩ độ (Lat)</th>
              <th style="width: 120px;">Kinh độ (Lng)</th>
              <th style="width: 100px;">Năm khởi dựng</th>
              <th style="width: 180px;">Người trông coi</th>
              <th style="width: 220px;">Link Google Maps</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF', excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh-sach-di-tich-Van-Dinh-${targetSites.length}-di-tich.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(`Đã xuất thành công file Excel bảng chuẩn (${targetSites.length} di tích)!`);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  // 3. XUẤT ẢNH BẢN ĐỒ (PNG CHẤT LƯỢNG CAO CÓ ĐẦY ĐỦ NỀN ĐƯỜNG PHỐ & ĐIỂM DI TÍCH)
  const handleExportMapImage = async () => {
    setIsExportingImage(true);
    try {
      const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
      if (!mapContainer) {
        throw new Error('Không tìm thấy bản đồ');
      }

      const width = mapContainer.clientWidth;
      const height = mapContainer.clientHeight;
      const containerRect = mapContainer.getBoundingClientRect();

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height + 70; // 50px cho tiêu đề xã, 20px cho ghi chú nguồn
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Không thể tạo canvas');

      // 1. Nền trắng
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Tải và vẽ toàn bộ các ô gạch bản đồ (Map Tiles) bằng fetch + ImageBitmap
      const tileImages = Array.from(mapContainer.querySelectorAll('.leaflet-tile-pane img')) as HTMLImageElement[];
      
      const drawTilePromises = tileImages.map(async (img) => {
        if (!img.src) return;
        const rect = img.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Chỉ vẽ tile nằm trong khung nhìn
        if (
          rect.bottom < containerRect.top || rect.top > containerRect.bottom ||
          rect.right < containerRect.left || rect.left > containerRect.right
        ) {
          return;
        }

        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top + 50;

        try {
          // Dùng fetch lấy blob để đảm bảo không bị lỗi bảo mật CORS
          const res = await fetch(img.src);
          const blob = await res.blob();
          const bmp = await createImageBitmap(blob);
          ctx.drawImage(bmp, x, y, rect.width, rect.height);
        } catch {
          // Thử vẽ trực tiếp nếu fetch không thành công
          try {
            ctx.drawImage(img, x, y, rect.width, rect.height);
          } catch {}
        }
      });

      await Promise.all(drawTilePromises);

      // 3. Vẽ các cụm di tích (Marker Clusters - vòng tròn gom nhóm 2, 3, 47...)
      const clusterElements = Array.from(mapContainer.querySelectorAll('.marker-cluster')) as HTMLElement[];
      clusterElements.forEach((cluster) => {
        const rect = cluster.getBoundingClientRect();
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top + 50;
        const text = cluster.innerText?.trim() || '';
        const num = parseInt(text, 10) || 0;
        const radius = Math.min(rect.width, rect.height) / 2 || 20;

        // Màu theo số lượng di tích trong cụm
        let mainColor = '#6ecc39';
        let ringColor = 'rgba(110, 204, 57, 0.4)';
        if (num >= 10 && num < 100) {
          mainColor = '#f0c20c';
          ringColor = 'rgba(240, 194, 12, 0.4)';
        } else if (num >= 100) {
          mainColor = '#f18017';
          ringColor = 'rgba(241, 128, 23, 0.4)';
        }

        // Vòng ngoài mờ
        ctx.fillStyle = ringColor;
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        ctx.fill();

        // Vòng trong đậm
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius - 4, 0, Math.PI * 2);
        ctx.fill();

        // Chữ số lượng di tích ở giữa
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + radius, y + radius);
      });

      // 4. Vẽ các điểm ghim di tích riêng lẻ (Marker Pins)
      const pinElements = Array.from(mapContainer.querySelectorAll('.leaflet-marker-icon:not(.marker-cluster)')) as HTMLElement[];
      for (const pin of pinElements) {
        const rect = pin.getBoundingClientRect();
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top + 50;

        if (pin instanceof HTMLImageElement && pin.complete && pin.naturalWidth !== 0) {
          try {
            ctx.drawImage(pin, x, y, rect.width, rect.height);
          } catch {
            ctx.fillStyle = '#0F3D5E';
            ctx.beginPath();
            ctx.arc(x + 14, y + 20, 9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 5. Vẽ Header trang trọng của UBND xã ở trên cùng
      ctx.fillStyle = '#0F3D5E';
      ctx.fillRect(0, 0, canvas.width, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('ỦY BAN NHÂN DÂN XÃ VÂN ĐÌNH — BẢN ĐỒ DI SẢN VĂN HÓA SỐ', 20, 25);

      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Tổng số: ${targetSites.length} di tích | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, canvas.width - 20, 25);

      // 6. Vẽ Footer ghi chú nguồn ở dưới cùng
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);

      ctx.fillStyle = '#5d7a8c';
      ctx.font = 'italic 11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Nguồn: Cổng thông tin Di sản văn hóa xã Vân Đình, huyện Ứng Hòa, TP. Hà Nội', 20, canvas.height - 12);

      ctx.textAlign = 'right';
      ctx.fillText('© OpenStreetMap contributors', canvas.width - 20, canvas.height - 12);

      // 7. Tạo file và tải xuống
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Không thể tạo file ảnh');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ban-do-di-san-xa-Van-Dinh-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExportSuccess('Đã tải ảnh bản đồ PNG thành công (đầy đủ bản đồ & di tích)!');
        setTimeout(() => setExportSuccess(null), 3500);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      alert('Không thể chụp bản đồ. Bạn có thể sử dụng mục "In báo cáo / Lưu PDF (Khổ A4)"!');
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        width: '100%',
        maxWidth: 580,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F3D5E, #1A5276)',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Printer size={20} color="#D4A017" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Xuất File Bản Đồ & Hồ Sơ Di Tích
              </h3>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
                Ủy ban nhân dân xã Vân Đình — Di sản văn hóa số
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#fff',
              cursor: 'pointer', opacity: 0.8, padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Thông báo thành công nếu có */}
          {exportSuccess && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 6,
              background: '#E8F8F5', border: '1px solid #A3E4D7',
              color: '#117864', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCircle size={16} /> {exportSuccess}
            </div>
          )}

          {/* Chọn phạm vi xuất */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#0F3D5E', display: 'block', marginBottom: 8 }}>
              Phạm vi dữ liệu xuất:
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setActiveTab('filtered')}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 6,
                  border: activeTab === 'filtered' ? '2px solid #0F3D5E' : '1px solid #ddd',
                  background: activeTab === 'filtered' ? '#EBF5FB' : '#fff',
                  color: activeTab === 'filtered' ? '#0F3D5E' : '#555',
                  fontWeight: activeTab === 'filtered' ? 700 : 500,
                  fontSize: 12, cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Theo bộ lọc hiện tại ({filteredSites.length} di tích)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 6,
                  border: activeTab === 'all' ? '2px solid #0F3D5E' : '1px solid #ddd',
                  background: activeTab === 'all' ? '#EBF5FB' : '#fff',
                  color: activeTab === 'all' ? '#0F3D5E' : '#555',
                  fontWeight: activeTab === 'all' ? 700 : 500,
                  fontSize: 12, cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Toàn bộ xã ({heritageSites.length} di tích)
              </button>
            </div>
          </div>

          {/* 3 Lựa chọn xuất */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Cách 1: In / Lưu PDF A4 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 14, borderRadius: 8, border: '1px solid #e1e8ed',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: '#EBF5FB', color: '#1B4F72',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Printer size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F3D5E' }}>
                    1. In báo cáo / Lưu PDF (Khổ A4)
                  </div>
                  <div style={{ fontSize: 12, color: '#5d7a8c', marginTop: 2 }}>
                    Chuẩn mẫu văn bản UBND xã: Quốc hiệu, bảng tổng hợp số liệu, bảng danh mục 108 điểm di tích và phần ký đóng dấu.
                  </div>
                </div>
              </div>
              <button
                onClick={handlePrintA4}
                style={{
                  padding: '8px 16px', borderRadius: 6,
                  background: '#0F3D5E', color: '#fff', border: 'none',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  flexShrink: 0, marginLeft: 12,
                }}
              >
                <Printer size={14} /> Mở bản in
              </button>
            </div>

            {/* Cách 2: Tải ảnh Bản đồ PNG */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 14, borderRadius: 8, border: '1px solid #e1e8ed',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: '#FEF9E7', color: '#B7950B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <ImageIcon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F3D5E' }}>
                    2. Tải ảnh Bản đồ (PNG)
                  </div>
                  <div style={{ fontSize: 12, color: '#5d7a8c', marginTop: 2 }}>
                    Chụp trực tiếp khung bản đồ đang hiển thị kèm tiêu đề UBND xã để chèn vào Word, slide thuyết trình hoặc in pano.
                  </div>
                </div>
              </div>
              <button
                onClick={handleExportMapImage}
                disabled={isExportingImage}
                style={{
                  padding: '8px 16px', borderRadius: 6,
                  background: '#B7950B', color: '#fff', border: 'none',
                  fontSize: 12, fontWeight: 700,
                  cursor: isExportingImage ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  flexShrink: 0, marginLeft: 12, opacity: isExportingImage ? 0.7 : 1,
                }}
              >
                <Download size={14} /> {isExportingImage ? 'Đang tạo...' : 'Tải ảnh PNG'}
              </button>
            </div>

            {/* Cách 3: Tải file Excel */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 14, borderRadius: 8, border: '1px solid #e1e8ed',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: '#E8F8F5', color: '#117864',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F3D5E' }}>
                    3. Tải danh mục Excel (.xlsx)
                  </div>
                  <div style={{ fontSize: 12, color: '#5d7a8c', marginTop: 2 }}>
                    Bảng tính Excel chuẩn tiếng Việt: Tên di tích, Thôn/Xóm, Cấp xếp hạng, Tọa độ GPS và Link chỉ đường.
                  </div>
                </div>
              </div>
              <button
                onClick={handleExportExcel}
                style={{
                  padding: '8px 16px', borderRadius: 6,
                  background: '#117864', color: '#fff', border: 'none',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  flexShrink: 0, marginLeft: 12,
                }}
              >
                <FileSpreadsheet size={14} /> Tải Excel
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          background: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px', borderRadius: 6,
              background: '#fff', border: '1px solid #cbd5e1',
              color: '#334155', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
