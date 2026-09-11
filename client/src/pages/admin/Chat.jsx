import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaMotorcycle, FaPaperPlane, FaPhone, FaEnvelope } from "react-icons/fa";
import api from "../../api/axios";

const Chat = () => {
    const { id } = useParams();
    const [inquiry, setInquiry] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEnd = useRef(null);

    const load = () => {
        api.get(`/inquiries/${id}`)
            .then((res) => {
                setInquiry(res.data.inquiry);
                setMessages(res.data.messages || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [id]);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || sending) return;

        setSending(true);
        try {
            const res = await api.post(`/inquiries/${id}/messages`, { message: newMsg.trim() });
            setMessages((prev) => [...prev, res.data.msg]);
            setNewMsg("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send");
        } finally {
            setSending(false);
        }
    };

    const handleStatus = async (status) => {
        try {
            await api.put(`/inquiries/${id}/status`, { status });
            setInquiry((prev) => ({ ...prev, status }));
        } catch {}
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!inquiry) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <p className="text-text-muted dark:text-dark-text-muted text-lg mb-4">Inquiry not found</p>
                <Link to="/admin/inquiries" className="text-primary hover:underline">Back to inquiries</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link to="/admin/inquiries" className="inline-flex items-center gap-2 text-sm text-text-muted dark:text-dark-text-muted hover:text-primary no-underline mb-6">
                <FaArrowLeft /> Back to inquiries
            </Link>

            {/* Inquiry header */}
            <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6 mb-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-text-heading dark:text-dark-text-heading mb-1">
                            {inquiry.customer_name}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-text-muted dark:text-dark-text-muted mb-2">
                            <span className="flex items-center gap-1"><FaPhone size={12} /> {inquiry.customer_phone}</span>
                            {inquiry.brand && (
                                <span className="flex items-center gap-1"><FaMotorcycle size={12} /> {inquiry.brand} {inquiry.model}</span>
                            )}
                        </div>
                        {inquiry.message && (
                            <p className="text-sm text-text dark:text-dark-text bg-surface-alt dark:bg-dark-surface rounded-lg p-3 mt-2">
                                {inquiry.message}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {["new", "replied", "closed"].map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatus(s)}
                                className={`text-xs font-medium px-3 py-1 rounded-full capitalize transition-colors ${
                                    inquiry.status === s
                                        ? "bg-primary text-white"
                                        : "border border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted hover:border-primary hover:text-primary"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border flex flex-col" style={{ height: "500px" }}>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                        <div className="text-center py-10 text-sm text-text-muted dark:text-dark-text-muted">
                            No messages yet. Send a reply below.
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                                msg.sender === "admin"
                                    ? "bg-primary text-white rounded-br-sm"
                                    : "bg-surface-alt dark:bg-dark-surface border border-border dark:border-dark-border text-text dark:text-dark-text rounded-bl-sm"
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                <p className={`text-xs mt-1 ${msg.sender === "admin" ? "text-white/60" : "text-text-muted dark:text-dark-text-muted"}`}>
                                    {new Date(msg.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEnd} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="border-t border-border dark:border-dark-border p-4 flex gap-3">
                    <input
                        type="text"
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <button
                        type="submit"
                        disabled={!newMsg.trim() || sending}
                        className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                    >
                        <FaPaperPlane size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
