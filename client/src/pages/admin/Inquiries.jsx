import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaComments, FaMotorcycle, FaEnvelope, FaPhone } from "react-icons/fa";
import api from "../../api/axios";

const statusStyles = {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    replied: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    closed: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
};

const Inquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.get("/inquiries")
            .then((res) => setInquiries(res.data.inquiries || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading">Inquiries</h1>
                <p className="text-sm text-text-muted dark:text-dark-text-muted">{inquiries.length} inquiry{inquiries.length !== 1 ? "ies" : ""}</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : inquiries.length === 0 ? (
                <div className="text-center py-20">
                    <FaComments className="text-4xl text-text-muted dark:text-dark-text-muted mx-auto mb-4" />
                    <p className="text-text-muted dark:text-dark-text-muted">No inquiries yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {inquiries.map((inq) => (
                        <Link
                            key={inq.id}
                            to={`/admin/inquiries/${inq.id}`}
                            className="block bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-4 hover:border-primary/50 transition-colors no-underline"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-text-heading dark:text-dark-text-heading text-sm truncate">
                                            {inq.customer_name}
                                        </h3>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[inq.status] || statusStyles.new}`}>
                                            {inq.status}
                                        </span>
                                        {parseInt(inq.message_count) > 0 && (
                                            <span className="text-xs text-text-muted dark:text-dark-text-muted flex items-center gap-1">
                                                <FaComments size={10} /> {inq.message_count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-text dark:text-dark-text truncate mb-1">
                                        {inq.message || "No message"}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-text-muted dark:text-dark-text-muted">
                                        {inq.brand && (
                                            <span className="flex items-center gap-1">
                                                <FaMotorcycle size={10} /> {inq.brand} {inq.model}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <FaPhone size={10} /> {inq.customer_phone}
                                        </span>
                                        <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Inquiries;
