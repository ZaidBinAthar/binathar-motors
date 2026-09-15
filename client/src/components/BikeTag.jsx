import { useEffect, useRef, useState, useCallback } from "react";
import { FaTimes, FaDownload, FaPrint, FaTag, FaCheckSquare, FaSquare } from "react-icons/fa";
import QRCode from "qrcode";

const SITE_URL = "https://binathar-motors.vercel.app";

// Single tag HTML template
const tagHTML = (bike, qrDataUrl) => {
  const url = `${SITE_URL}/bikes/${bike.id}`;
  const statusColor = bike.status === "sold" ? "#ef4444" : "#22c55e";
  const statusText = bike.status === "sold" ? "SOLD" : "AVAILABLE";
  const statusBg = bike.status === "sold" ? "#fef2f2" : "#f0fdf4";

  return `
    <div class="tag">
      <div class="tag-header">
        <span class="store-name">BINATHAR MOTORS</span>
      </div>
      <div class="tag-body">
        <div class="status-badge" style="background:${statusBg};color:${statusColor};border:1px solid ${statusColor}30">
          ● ${statusText}
        </div>
        <div class="bike-name">${bike.brand} ${bike.model}</div>
        <div class="bike-year">Model ${bike.model_year}</div>
        <div class="bike-price">Rs. ${Number(bike.selling_price).toLocaleString()}</div>
        <div class="tag-details">
          ${bike.engine_cc ? `<span>${bike.engine_cc}cc</span>` : ""}
          ${bike.condition ? `<span>${bike.condition}</span>` : ""}
          ${bike.color ? `<span>${bike.color}</span>` : ""}
        </div>
        <div class="qr-section">
          ${qrDataUrl ? `<img src="${qrDataUrl}" class="qr-img" />` : ""}
        </div>
        <div class="scan-text">Scan to view bike details</div>
        <div class="listing-id">Listing #${bike.id}</div>
      </div>
      <div class="tag-footer">
        BinAthar Motors — Quality Used Motorcycles
      </div>
    </div>
  `;
};

// Print styles for tags
const printStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; }
  .tags-grid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; padding: 16px; }
  .tag { width: 320px; border: 2.5px solid #0d9488; border-radius: 10px; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
  .tag-header { background: #0d9488; padding: 10px 16px; text-align: center; }
  .store-name { color: #fff; font-size: 15px; font-weight: 800; letter-spacing: 1.5px; }
  .tag-body { padding: 14px 16px; text-align: center; }
  .status-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 10px; border-radius: 20px; margin-bottom: 8px; letter-spacing: 0.5px; }
  .bike-name { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
  .bike-year { font-size: 13px; color: #64748b; margin-bottom: 8px; }
  .bike-price { font-size: 22px; font-weight: 900; color: #0d9488; margin-bottom: 8px; }
  .tag-details { display: flex; gap: 8px; justify-content: center; margin-bottom: 10px; }
  .tag-details span { font-size: 10px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 10px; }
  .qr-section { display: flex; justify-content: center; margin: 8px 0; }
  .qr-img { width: 140px; height: 140px; }
  .scan-text { font-size: 10px; color: #64748b; margin-bottom: 2px; }
  .listing-id { font-size: 9px; color: #94a3b8; margin-bottom: 4px; }
  .tag-footer { border-top: 1px solid #e2e8f0; padding: 6px; text-align: center; font-size: 8px; color: #94a3b8; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .tags-grid { gap: 12px; padding: 10px; }
    .tag { border-width: 2px; }
    @page { margin: 8mm; size: A4; }
  }
`;

// Generate QR data URL for a bike
const generateQR = (bikeId) => {
  return QRCode.toDataURL(`${SITE_URL}/bikes/${bikeId}`, {
    width: 200,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
};

// Single Bike Tag Modal (preview + download + print)
export const BikeTagModal = ({ bike, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    generateQR(bike.id).then(setQrDataUrl);
  }, [bike.id]);

  const handleDownload = async () => {
    const qr = qrDataUrl || await generateQR(bike.id);
    const card = document.createElement("canvas");
    card.width = 480;
    card.height = 700;
    const ctx = card.getContext("2d");

    // White bg
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 480, 700);

    // Border
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 468, 688);

    // Header
    ctx.fillStyle = "#0d9488";
    ctx.fillRect(6, 6, 468, 50);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BINATHAR MOTORS", 240, 38);

    // Status
    const statusColor = bike.status === "sold" ? "#ef4444" : "#22c55e";
    const statusText = bike.status === "sold" ? "● SOLD" : "● AVAILABLE";
    ctx.fillStyle = statusColor;
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(statusText, 240, 80);

    // Bike name
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`${bike.brand} ${bike.model}`, 240, 120);

    // Year
    ctx.fillStyle = "#64748b";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Model ${bike.model_year}`, 240, 148);

    // Price
    ctx.fillStyle = "#0d9488";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(`Rs. ${Number(bike.selling_price).toLocaleString()}`, 240, 195);

    // Details line
    const details = [bike.engine_cc ? `${bike.engine_cc}cc` : "", bike.condition, bike.color].filter(Boolean).join("  •  ");
    if (details) {
      ctx.fillStyle = "#64748b";
      ctx.font = "12px sans-serif";
      ctx.fillText(details, 240, 225);
    }

    // QR code
    if (qr) {
      const img = new Image();
      img.src = qr;
      await new Promise((r) => { img.onload = r; });
      ctx.drawImage(img, 170, 245, 140, 140);
    }

    // Scan text
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.fillText("Scan to view bike details", 240, 410);

    // Listing ID
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText(`Listing #${bike.id}`, 240, 430);

    // Footer line
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 460);
    ctx.lineTo(460, 460);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px sans-serif";
    ctx.fillText("BinAthar Motors — Quality Used Motorcycles", 240, 480);

    const link = document.createElement("a");
    link.download = `BinAtharMotors-Tag-${bike.brand}-${bike.model}-${bike.id}.png`;
    link.href = card.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=500,height=700");
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Tag - ${bike.brand} ${bike.model}</title><style>${printStyles}</style></head><body><div class="tags-grid">${tagHTML(bike, qrDataUrl)}</div></body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-sm animate-page-in">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border dark:border-dark-border">
          <h2 className="text-base font-semibold text-text-heading dark:text-dark-text-heading flex items-center gap-2">
            <FaTag size={16} /> Bike Tag
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt">
            <FaTimes size={14} />
          </button>
        </div>

        {/* Tag Preview */}
        <div className="p-5">
          <div className="border-2 border-primary rounded-xl overflow-hidden text-center">
            <div className="bg-primary py-2.5">
              <p className="text-white font-bold tracking-wider text-xs">BINATHAR MOTORS</p>
            </div>
            <div className="pt-3 pb-1 px-4">
              <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 ${
                bike.status === "sold"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}>
                ● {bike.status === "sold" ? "SOLD" : "AVAILABLE"}
              </span>
              <p className="text-base font-bold text-text-heading dark:text-dark-text-heading">
                {bike.brand} {bike.model}
              </p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted">
                Model {bike.model_year}
              </p>
              <p className="text-lg font-extrabold text-primary mt-0.5">
                Rs. {Number(bike.selling_price).toLocaleString()}
              </p>
              <div className="flex gap-1.5 justify-center mt-1.5 flex-wrap">
                {bike.engine_cc && <span className="text-[10px] text-text-muted dark:text-dark-text-muted bg-surface-alt dark:bg-dark-surface px-2 py-0.5 rounded-full">{bike.engine_cc}cc</span>}
                {bike.condition && <span className="text-[10px] text-text-muted dark:text-dark-text-muted bg-surface-alt dark:bg-dark-surface px-2 py-0.5 rounded-full">{bike.condition}</span>}
                {bike.color && <span className="text-[10px] text-text-muted dark:text-dark-text-muted bg-surface-alt dark:bg-dark-surface px-2 py-0.5 rounded-full">{bike.color}</span>}
              </div>
            </div>
            <div className="flex justify-center py-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR" className="w-[120px] h-[120px]" />
              ) : (
                <div className="w-[120px] h-[120px] bg-surface-alt rounded flex items-center justify-center text-xs text-text-muted">Loading...</div>
              )}
            </div>
            <p className="text-[10px] text-text-muted dark:text-dark-text-muted">Scan to view bike details</p>
            <p className="text-[9px] text-text-muted dark:text-dark-text-muted">Listing #{bike.id}</p>
            <div className="border-t border-border dark:border-dark-border" />
            <p className="text-[8px] text-text-muted dark:text-dark-text-muted py-1.5">
              BinAthar Motors — Quality Used Motorcycles
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors">
            <FaDownload size={13} /> Download
          </button>
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border dark:border-dark-border text-text dark:text-dark-text text-sm font-medium rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors">
            <FaPrint size={13} /> Print Tag
          </button>
        </div>
      </div>
    </div>
  );
};

// Multi-Tag Print Sheet (used from Dashboard)
export const printMultiTags = async (bikes) => {
  const qrPromises = bikes.map((b) => generateQR(b.id));
  const qrDataUrls = await Promise.all(qrPromises);

  const tagsHTML = bikes.map((bike, i) => tagHTML(bike, qrDataUrls[i])).join("");

  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.write(`<!DOCTYPE html><html><head><title>BinAthar Motors - Bike Tags</title><style>${printStyles}</style></head><body><div class="tags-grid">${tagsHTML}</div></body></html>`);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
};

export default BikeTagModal;
