import { useRef } from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });
};

const SaleReceipt = ({ sale, bike, onClose }) => {
  const receiptRef = useRef();

  const handlePrint = () => {
    const content = receiptRef.current;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${sale.receipt_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; background: #fff; }
          .receipt { max-width: 700px; margin: 0 auto; padding: 40px 36px; }
          .header { text-align: center; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 24px; }
          .header h1 { font-size: 26px; font-weight: 800; color: #0d9488; letter-spacing: 1px; }
          .header p { font-size: 12px; color: #64748b; margin-top: 4px; }
          .receipt-no { text-align: center; margin-bottom: 24px; }
          .receipt-no span { display: inline-block; background: #f0fdfa; border: 1px solid #0d9488; color: #0d9488; padding: 6px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #0d9488; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .row .label { color: #64748b; }
          .row .value { font-weight: 600; color: #0f172a; text-align: right; }
          .total-row { border-top: 2px solid #0d9488; margin-top: 8px; padding-top: 10px; }
          .total-row .label { font-size: 15px; font-weight: 700; color: #0f172a; }
          .total-row .value { font-size: 18px; font-weight: 800; color: #0d9488; }
          .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 2px dashed #e2e8f0; }
          .footer .thankyou { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 6px; }
          .footer .note { font-size: 11px; color: #94a3b8; }
          .divider { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .receipt { padding: 20px 24px; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>BINATHAR MOTORS</h1>
            <p>Quality Used Motorcycles</p>
          </div>

          <div class="receipt-no">
            <span>RECEIPT ${sale.receipt_number}</span>
          </div>

          <div class="section">
            <div class="section-title">Bike Information</div>
            <div class="row"><span class="label">Brand</span><span class="value">${bike.brand}</span></div>
            <div class="row"><span class="label">Model</span><span class="value">${bike.model}</span></div>
            <div class="row"><span class="label">Year</span><span class="value">${bike.model_year}</span></div>
            ${bike.registration_city ? `<div class="row"><span class="label">Registration City</span><span class="value">${bike.registration_city}</span></div>` : ""}
            ${bike.engine_cc ? `<div class="row"><span class="label">Engine</span><span class="value">${bike.engine_cc}cc</span></div>` : ""}
            ${bike.color ? `<div class="row"><span class="label">Color</span><span class="value">${bike.color}</span></div>` : ""}
            <div class="row"><span class="label">Condition</span><span class="value">${bike.condition || "N/A"}</span></div>
          </div>

          <hr class="divider" />

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="row"><span class="label">Name</span><span class="value">${sale.customer_name || "—"}</span></div>
            <div class="row"><span class="label">Phone</span><span class="value">${sale.customer_phone || "—"}</span></div>
          </div>

          <hr class="divider" />

          <div class="section">
            <div class="section-title">Sale Information</div>
            <div class="row"><span class="label">Sale Date</span><span class="value">${formatDate(sale.sale_date || sale.created_at)}</span></div>
            <div class="row"><span class="label">Receipt Number</span><span class="value">${sale.receipt_number}</span></div>
            <div class="row total-row"><span class="label">Sale Price</span><span class="value">Rs. ${Number(sale.sale_price).toLocaleString()}</span></div>
          </div>

          <div class="footer">
            <p class="thankyou">Thank you for choosing BinAthar Motors.</p>
            <p class="note">This is a computer-generated receipt. For any queries, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-lg animate-page-in max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border shrink-0">
          <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading">
            Sale Receipt
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              <FaPrint size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface-alt"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Receipt preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={receiptRef} className="bg-white text-slate-800 rounded-lg border border-slate-200 p-8 max-w-[600px] mx-auto" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            {/* Header */}
            <div className="text-center border-b-[3px] border-teal-600 pb-5 mb-6">
              <h1 className="text-2xl font-extrabold text-teal-600 tracking-wide">BINATHAR MOTORS</h1>
              <p className="text-xs text-slate-400 mt-1">Quality Used Motorcycles</p>
            </div>

            {/* Receipt Number */}
            <div className="text-center mb-6">
              <span className="inline-block bg-teal-50 border border-teal-600 text-teal-700 px-5 py-1.5 rounded text-xs font-semibold tracking-wider">
                RECEIPT {sale.receipt_number}
              </span>
            </div>

            {/* Bike Info */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-200 pb-1 mb-2">Bike Information</p>
              <InfoRow label="Brand" value={bike.brand} />
              <InfoRow label="Model" value={bike.model} />
              <InfoRow label="Year" value={bike.model_year} />
              {bike.registration_city && <InfoRow label="Registration City" value={bike.registration_city} />}
              {bike.engine_cc && <InfoRow label="Engine" value={`${bike.engine_cc}cc`} />}
              {bike.color && <InfoRow label="Color" value={bike.color} />}
              <InfoRow label="Condition" value={bike.condition || "N/A"} />
            </div>

            <hr className="border-slate-200 my-4" />

            {/* Customer Info */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-200 pb-1 mb-2">Customer Information</p>
              <InfoRow label="Name" value={sale.customer_name || "—"} />
              <InfoRow label="Phone" value={sale.customer_phone || "—"} />
            </div>

            <hr className="border-slate-200 my-4" />

            {/* Sale Info */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-200 pb-1 mb-2">Sale Information</p>
              <InfoRow label="Sale Date" value={formatDate(sale.sale_date || sale.created_at)} />
              <InfoRow label="Receipt Number" value={sale.receipt_number} />
              <div className="flex justify-between py-2.5 border-t-2 border-teal-600 mt-2">
                <span className="text-sm font-bold text-slate-800">Sale Price</span>
                <span className="text-lg font-extrabold text-teal-600">Rs. {Number(sale.sale_price).toLocaleString()}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-5 border-t-2 border-dashed border-slate-200">
              <p className="text-sm font-semibold text-slate-800 mb-1">Thank you for choosing BinAthar Motors.</p>
              <p className="text-[10px] text-slate-400">This is a computer-generated receipt. For any queries, please contact us.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-1.5 text-xs">
    <span className="text-slate-400">{label}</span>
    <span className="font-semibold text-slate-800 text-right">{value}</span>
  </div>
);

export default SaleReceipt;
