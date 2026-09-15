import { useEffect, useRef, useState } from "react";
import { FaTimes, FaDownload, FaPrint, FaQrcode } from "react-icons/fa";
import QRCode from "qrcode";

const SITE_URL = "https://binathar-motors.vercel.app";

const QRModal = ({ bike, onClose }) => {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const bikeUrl = `${SITE_URL}/bikes/${bike.id}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, bikeUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then(() => setReady(true))
      .catch(() => {});
  }, [bikeUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a combined image: bike info card + QR code
    const card = document.createElement("canvas");
    card.width = 600;
    card.height = 820;
    const ctx = card.getContext("2d");

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 820);

    // Border
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 800);

    // Header bar
    ctx.fillStyle = "#0d9488";
    ctx.fillRect(10, 10, 580, 70);

    // Store name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BINATHAR MOTORS", 300, 55);

    // Bike brand + model
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(`${bike.brand} ${bike.model}`, 300, 130);

    // Year
    ctx.fillStyle = "#64748b";
    ctx.font = "24px sans-serif";
    ctx.fillText(`Model ${bike.model_year}`, 300, 170);

    // Price
    ctx.fillStyle = "#0d9488";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(`Rs. ${Number(bike.selling_price).toLocaleString()}`, 300, 230);

    // QR code
    const qrSize = 300;
    const qrX = (600 - qrSize) / 2;
    ctx.drawImage(canvasRef.current, qrX, 270, qrSize, qrSize);

    // "Scan to view" text
    ctx.fillStyle = "#64748b";
    ctx.font = "18px sans-serif";
    ctx.fillText("Scan to view bike details", 300, 620);

    // URL text
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText(bikeUrl, 300, 650);

    // Footer
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(10, 700, 580, 2);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("BinAthar Motors — Quality Used Motorcycles", 300, 740);

    // Trigger download
    const link = document.createElement("a");
    link.download = `BinAtharMotors-${bike.brand}-${bike.model}-${bike.id}.png`;
    link.href = card.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const printWindow = window.open("", "_blank", "width=600,height=800");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR - ${bike.brand} ${bike.model}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .card { width: 400px; border: 3px solid #0d9488; border-radius: 12px; overflow: hidden; text-align: center; }
          .header { background: #0d9488; color: white; padding: 16px; }
          .header h1 { font-size: 22px; letter-spacing: 1px; }
          .info { padding: 24px 20px; }
          .bike-name { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
          .bike-year { font-size: 16px; color: #64748b; margin-bottom: 12px; }
          .bike-price { font-size: 26px; font-weight: 800; color: #0d9488; margin-bottom: 20px; }
          .qr { margin: 0 auto 16px; }
          .qr img { width: 220px; height: 220px; }
          .scan-text { font-size: 14px; color: #64748b; margin-bottom: 4px; }
          .url { font-size: 11px; color: #94a3b8; word-break: break-all; }
          .footer { border-top: 1px solid #e2e8f0; padding: 12px; font-size: 11px; color: #94a3b8; }
          @media print { body { padding: 0; } .card { border-width: 2px; } @page { margin: 10mm; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header"><h1>BINATHAR MOTORS</h1></div>
          <div class="info">
            <div class="bike-name">${bike.brand} ${bike.model}</div>
            <div class="bike-year">Model ${bike.model_year}</div>
            <div class="bike-price">Rs. ${Number(bike.selling_price).toLocaleString()}</div>
            <div class="qr"><img src="${canvas.toDataURL("image/png")}" /></div>
            <div class="scan-text">Scan to view bike details</div>
            <div class="url">${bikeUrl}</div>
          </div>
          <div class="footer">BinAthar Motors — Quality Used Motorcycles</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-sm animate-page-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border dark:border-dark-border">
          <h2 className="text-base font-semibold text-text-heading dark:text-dark-text-heading flex items-center gap-2">
            <FaQrcode size={16} /> QR Code
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-5">
          <div className="border-2 border-primary rounded-xl overflow-hidden text-center">
            {/* Header */}
            <div className="bg-primary py-3">
              <p className="text-white font-bold tracking-wider text-sm">BINATHAR MOTORS</p>
            </div>

            {/* Bike Info */}
            <div className="pt-4 pb-2 px-4">
              <p className="text-lg font-bold text-text-heading dark:text-dark-text-heading">
                {bike.brand} {bike.model}
              </p>
              <p className="text-sm text-text-muted dark:text-dark-text-muted">
                Model {bike.model_year}
              </p>
              <p className="text-xl font-extrabold text-primary mt-1">
                Rs. {Number(bike.selling_price).toLocaleString()}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center py-3">
              <canvas ref={canvasRef} className="rounded" />
            </div>

            {/* Footer text */}
            <p className="text-xs text-text-muted dark:text-dark-text-muted pb-1">
              Scan to view bike details
            </p>
            <p className="text-[10px] text-text-muted dark:text-dark-text-muted pb-3 break-all px-4">
              {bikeUrl}
            </p>

            <div className="border-t border-border dark:border-dark-border" />
            <p className="text-[10px] text-text-muted dark:text-dark-text-muted py-2">
              BinAthar Motors — Quality Used Motorcycles
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleDownload}
            disabled={!ready}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <FaDownload size={13} /> Download
          </button>
          <button
            onClick={handlePrint}
            disabled={!ready}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border dark:border-dark-border text-text dark:text-dark-text text-sm font-medium rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt transition-colors disabled:opacity-50"
          >
            <FaPrint size={13} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
