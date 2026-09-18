import { useState, useEffect, useCallback } from "react";
import {
  FaMotorcycle,
  FaDollarSign,
  FaChartLine,
  FaComments,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import api from "../../api/axios";

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [brands, setBrands] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [brand, setBrand] = useState("");

  const fetchReports = useCallback(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (brand) params.brand = brand;

    api
      .get("/reports", { params })
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load reports"))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, brand]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    api.get("/reports/brands").then((res) => setBrands(res.data.brands || [])).catch(() => {});
  }, []);

  const hasFilters = dateFrom || dateTo || brand;

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setBrand("");
  };

  const inputClass =
    "px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-6 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, monthlySales, brandPerformance, inquiryStats, recentSales } = data;
  const o = {
    totalBikes: Number(overview.total_bikes),
    available: Number(overview.available_bikes),
    sold: Number(overview.sold_bikes),
    revenue: Number(overview.total_revenue),
    profit: Number(overview.total_profit),
    avgProfit: Number(overview.avg_profit),
    totalSales: Number(overview.total_sales),
    totalUsers: Number(overview.total_users),
    totalInquiries: Number(overview.total_inquiries),
  };

  const maxRevenue = Math.max(...monthlySales.map((m) => Number(m.revenue)), 1);

  const fmt = (n) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n);

  const statCards = [
    { label: "Total Bikes", value: o.totalBikes, icon: FaMotorcycle, color: "bg-blue-500" },
    { label: "Available", value: o.available, icon: FaArrowUp, color: "bg-green-500" },
    { label: "Sold", value: o.sold, icon: FaArrowDown, color: "bg-orange-500" },
    { label: "Total Sales", value: o.totalSales, icon: FaExchangeAlt, color: "bg-purple-500" },
    { label: "Total Revenue", value: fmt(o.revenue), icon: FaDollarSign, color: "bg-primary" },
    { label: "Total Profit", value: fmt(o.profit), icon: FaChartLine, color: "bg-emerald-500" },
    { label: "Avg Profit/Sale", value: fmt(o.avgProfit), icon: FaDollarSign, color: "bg-amber-500" },
    { label: "Inquiries", value: o.totalInquiries, icon: FaComments, color: "bg-cyan-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading">
          Owner Reports
        </h1>
        {loading && (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-4 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter size={14} className="text-primary" />
          <span className="text-sm font-medium text-text-heading dark:text-dark-text-heading">Filters</span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Brand</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass}>
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FaTimes size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color} text-white`}>
                <card.icon size={16} />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-dark-text-muted">{card.label}</p>
                <p className="text-lg font-bold text-text-heading dark:text-dark-text-heading">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Sales Chart */}
      {monthlySales.length > 0 && (
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6 mb-8">
          <h2 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-4">
            Monthly Sales
          </h2>
          <div className="flex items-end gap-2 h-48">
            {monthlySales.map((m, i) => {
              const height = (Number(m.revenue) / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-text-muted dark:text-dark-text-muted">
                    {fmt(Number(m.revenue))}
                  </div>
                  <div
                    className="w-full bg-primary rounded-t-md transition-all duration-500 hover:bg-primary-dark relative group"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {m.sales_count} sales — {fmt(Number(m.revenue))}
                    </div>
                  </div>
                  <div className="text-[10px] text-text-muted dark:text-dark-text-muted">
                    {m.month.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-muted dark:text-dark-text-muted">
            <span>Revenue (bars)</span>
            <span>Hover for details</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Brand Performance */}
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h2 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-4">
            Brand Performance
          </h2>
          {brandPerformance.length === 0 ? (
            <p className="text-sm text-text-muted dark:text-dark-text-muted text-center py-8">
              No bike data yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-dark-border">
                    <th className="text-left py-2 text-text-muted dark:text-dark-text-muted font-medium">Brand</th>
                    <th className="text-center py-2 text-text-muted dark:text-dark-text-muted font-medium">Stock</th>
                    <th className="text-center py-2 text-text-muted dark:text-dark-text-muted font-medium">Sold</th>
                    <th className="text-right py-2 text-text-muted dark:text-dark-text-muted font-medium">Revenue</th>
                    <th className="text-right py-2 text-text-muted dark:text-dark-text-muted font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {brandPerformance.map((b, i) => (
                    <tr key={i} className="border-b border-border/50 dark:border-dark-border/50 last:border-0">
                      <td className="py-2.5 font-medium text-text-heading dark:text-dark-text-heading">{b.brand}</td>
                      <td className="py-2.5 text-center text-text dark:text-dark-text">{b.available_bikes}</td>
                      <td className="py-2.5 text-center text-text dark:text-dark-text">{b.sold_bikes}</td>
                      <td className="py-2.5 text-right text-text dark:text-dark-text">{fmt(Number(b.revenue))}</td>
                      <td className={`py-2.5 text-right font-medium ${Number(b.profit) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {fmt(Number(b.profit))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inquiry Analytics */}
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h2 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-4">
            Inquiry Analytics
          </h2>
          <div className="space-y-4">
            {[
              { label: "Total Inquiries", value: Number(inquiryStats.total), color: "bg-gray-500" },
              { label: "New (Unread)", value: Number(inquiryStats.new), color: "bg-blue-500" },
              { label: "Contacted", value: Number(inquiryStats.contacted), color: "bg-amber-500" },
              { label: "Closed", value: Number(inquiryStats.closed), color: "bg-green-500" },
              { label: "This Month", value: Number(inquiryStats.this_month), color: "bg-purple-500" },
              { label: "This Week", value: Number(inquiryStats.this_week), color: "bg-cyan-500" },
            ].map((item, i) => {
              const pct = Number(inquiryStats.total) > 0 ? (item.value / Number(inquiryStats.total)) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text dark:text-dark-text">{item.label}</span>
                    <span className="font-medium text-text-heading dark:text-dark-text-heading">{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-border dark:bg-dark-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-surface-alt dark:bg-dark-surface rounded-lg">
            <p className="text-xs text-text-muted dark:text-dark-text-muted mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-primary">
              {o.totalInquiries > 0
                ? `${((o.sold / o.totalInquiries) * 100).toFixed(1)}%`
                : "0%"}
            </p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
              {o.sold} sales from {o.totalInquiries} inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      {recentSales.length > 0 && (
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6">
          <h2 className="text-lg font-bold text-text-heading dark:text-dark-text-heading mb-4">
            Recent Sales
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-dark-border">
                  <th className="text-left py-2 text-text-muted dark:text-dark-text-muted font-medium">Date</th>
                  <th className="text-left py-2 text-text-muted dark:text-dark-text-muted font-medium">Bike</th>
                  <th className="text-left py-2 text-text-muted dark:text-dark-text-muted font-medium">Customer</th>
                  <th className="text-right py-2 text-text-muted dark:text-dark-text-muted font-medium">Cost</th>
                  <th className="text-right py-2 text-text-muted dark:text-dark-text-muted font-medium">Sold For</th>
                  <th className="text-right py-2 text-text-muted dark:text-dark-text-muted font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s, i) => {
                  const profit = Number(s.sale_price) - Number(s.purchase_price);
                  return (
                    <tr key={i} className="border-b border-border/50 dark:border-dark-border/50 last:border-0">
                      <td className="py-2.5 text-text dark:text-dark-text">
                        {new Date(s.sale_date).toLocaleDateString("en-PK")}
                      </td>
                      <td className="py-2.5 font-medium text-text-heading dark:text-dark-text-heading">
                        {s.brand} {s.model} {s.model_year}
                      </td>
                      <td className="py-2.5 text-text dark:text-dark-text">{s.customer_name || "—"}</td>
                      <td className="py-2.5 text-right text-text dark:text-dark-text">{fmt(Number(s.purchase_price))}</td>
                      <td className="py-2.5 text-right text-text dark:text-dark-text">{fmt(Number(s.sale_price))}</td>
                      <td className={`py-2.5 text-right font-medium ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {fmt(profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
