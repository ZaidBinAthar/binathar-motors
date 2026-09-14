import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaMotorcycle, FaUsers, FaComments, FaMoneyBill } from "react-icons/fa";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import BikeForm from "./BikeForm";
import MarkSoldModal from "./MarkSoldModal";
import SaleReceipt from "../../components/SaleReceipt";

const Dashboard = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [soldBike, setSoldBike] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const { isOwner } = useAuth();

  const load = () => {
    setLoading(true);
    api
      .get("/bikes")
      .then((res) => setBikes(res.data.bikes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, brand, model) => {
    if (!confirm(`Delete ${brand} ${model}?`)) return;
    try {
      await api.delete(`/bikes/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleEdit = async (bike) => {
    try {
      const res = await api.get(`/bikes/${bike.id}`);
      setEditing({ ...bike, images: res.data.images || [] });
      setShowForm(true);
    } catch {
      setEditing(bike);
      setShowForm(true);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleSaleRecorded = (sale, bike) => {
    setSoldBike(null);
    setReceiptData({ sale, bike });
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/admin/inquiries" className="flex items-center gap-3 bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-4 hover:border-primary/50 transition-colors no-underline">
          <FaComments className="text-primary" size={20} />
          <div>
            <p className="font-semibold text-text-heading dark:text-dark-text-heading text-sm">Inquiries</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">Customer messages</p>
          </div>
        </Link>
        {isOwner && (
          <Link to="/admin/users" className="flex items-center gap-3 bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-4 hover:border-primary/50 transition-colors no-underline">
            <FaUsers className="text-primary" size={20} />
            <div>
              <p className="font-semibold text-text-heading dark:text-dark-text-heading text-sm">Users</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted">Manage accounts</p>
            </div>
          </Link>
        )}
        <div className="flex items-center gap-3 bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-4">
          <FaMotorcycle className="text-primary" size={20} />
          <div>
            <p className="font-semibold text-text-heading dark:text-dark-text-heading text-sm">{bikes.length} Bikes</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">In inventory</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading">Bike Inventory</h1>
          <p className="text-sm text-text-muted dark:text-dark-text-muted">{bikes.length} bike{bikes.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <FaPlus size={14} /> Add Bike
        </button>
      </div>

      {/* Bike Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <BikeForm
              bike={editing}
              onSaved={handleSaved}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}

      {/* Mark as Sold modal */}
      {soldBike && (
        <MarkSoldModal
          bike={soldBike}
          onClose={() => setSoldBike(null)}
          onSaleRecorded={handleSaleRecorded}
        />
      )}

      {/* Sale Receipt modal */}
      {receiptData && (
        <SaleReceipt
          sale={receiptData.sale}
          bike={receiptData.bike}
          onClose={() => setReceiptData(null)}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bikes.length === 0 ? (
        <div className="text-center py-20">
          <FaMotorcycle className="text-4xl text-text-muted dark:text-dark-text-muted mx-auto mb-4" />
          <p className="text-text-muted dark:text-dark-text-muted">No bikes yet. Add your first one!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-dark-border">
                  <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Image</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Bike</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Year</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Condition</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bikes.map((bike) => (
                  <tr key={bike.id} className="border-b border-border dark:border-dark-border last:border-0 hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors">
                    <td className="px-4 py-3">
                      {bike.cover_image ? (
                        <img src={bike.cover_image} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-surface-alt dark:bg-dark-surface flex items-center justify-center text-text-muted text-xs">No img</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-heading dark:text-dark-text-heading">{bike.brand} {bike.model}</p>
                      {bike.color && <p className="text-xs text-text-muted dark:text-dark-text-muted">{bike.color}</p>}
                    </td>
                    <td className="px-4 py-3 text-text dark:text-dark-text">{bike.model_year}</td>
                    <td className="px-4 py-3 font-medium text-text-heading dark:text-dark-text-heading">Rs. {Number(bike.selling_price).toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize text-text dark:text-dark-text">{bike.condition}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        bike.status === "available"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : bike.status === "sold"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                      }`}>
                        {bike.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {bike.status === "available" && (
                          <button
                            onClick={() => setSoldBike(bike)}
                            className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-text-muted hover:text-green-600 transition-colors"
                            title="Mark as Sold"
                          >
                            <FaMoneyBill size={14} />
                          </button>
                        )}
                        <button onClick={() => handleEdit(bike)} className="p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface text-text-muted hover:text-primary transition-colors" title="Edit">
                          <FaEdit size={14} />
                        </button>
                        {isOwner && (
                          <button onClick={() => handleDelete(bike.id, bike.brand, bike.model)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors" title="Delete">
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
