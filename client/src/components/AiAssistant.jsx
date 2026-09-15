import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaMotorcycle,
  FaChartBar,
  FaComments,
  FaSearch,
  FaCog,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../api/axios";

const ACTION_LINKS = {
  inventory_summary: "/admin",
  bike_list: "/admin",
  brand_search: "/bikes",
  price_search: "/bikes",
  bike_detail: null,
  old_inventory: "/admin",
  recent_sales: "/admin",
  monthly_sales: "/admin",
  sales_summary: "/admin",
  popular_bikes: "/admin",
  no_inquiries: "/admin/inquiries",
  inquiry_summary: "/admin/inquiries",
  recent_inquiries: "/admin/inquiries",
  brand_performance: "/admin",
  sell_request_summary: "/admin/sell-requests",
  review_summary: "/admin/reviews",
  user_summary: "/admin/users",
  business_overview: "/admin/reports",
  attention_needed: "/admin",
  follow_up: null,
};

const ACTION_LABELS = {
  inventory_summary: "View Inventory",
  bike_list: "View Inventory",
  old_inventory: "View Inventory",
  popular_bikes: "View Inventory",
  no_inquiries: "View Inventory",
  attention_needed: "View Inventory",
  brand_search: "Browse Bikes",
  price_search: "Browse Bikes",
  monthly_sales: "View Reports",
  sales_summary: "View Reports",
  brand_performance: "View Reports",
  business_overview: "View Reports",
  inquiry_summary: "View Inquiries",
  recent_inquiries: "View Inquiries",
  review_summary: "View Reviews",
  user_summary: "View Users",
  sell_request_summary: "View Sell Requests",
};

function parseMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, "<br>");

  // Convert markdown tables to HTML tables
  const lines = html.split("<br>");
  let inTable = false;
    let tableLines = [];
    let result = [];

    for (const line of lines) {
        if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
            const cells = line.split("|").filter(c => c.trim() !== "").map(c => c.trim());
            if (cells.every(c => /^-+$/.test(c.replace(/\s/g, "")))) {
                continue;
            }
            if (!inTable) {
                inTable = true;
                tableLines = [];
                result.push("<div class='overflow-x-auto my-2'><table class='text-xs border-collapse w-full'>");
                result.push("<thead><tr>" + cells.map(c => `<th class='px-2 py-1 text-left border-b border-border dark:border-dark-border text-text-muted dark:text-dark-text-muted font-medium'>${c}</th>`).join("") + "</tr></thead>");
                result.push("<tbody>");
            } else {
                result.push("<tr>" + cells.map(c => `<td class='px-2 py-1 border-b border-border/50 dark:border-dark-border/50 text-text dark:text-dark-text'>${c}</td>`).join("") + "</tr>");
            }
        } else {
            if (inTable) {
                result.push("</tbody></table></div>");
                inTable = false;
            }
            result.push(line);
        }
    }
    if (inTable) {
        result.push("</tbody></table></div>");
    }

    // Convert blockquotes
    return result.join("<br>").replace(/&gt;\s*(.+?)(<br>|$)/g, '<div class="border-l-2 border-primary/40 pl-3 py-1 my-1 text-xs text-text-muted dark:text-dark-text-muted italic">$1</div>');
}

const AiAssistant = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: "Hello! I'm the BinAthar Motors AI Assistant. I can help you understand your dealership data.\n\nAsk me anything about **inventory**, **sales**, **inquiries**, or **performance**.",
      data: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    api
      .get("/ai-assistant/suggestions")
      .then((res) => setSuggestions(res.data.suggestions))
      .catch(() => {});
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await api.post("/ai-assistant/chat", {
        question: text.trim(),
        context,
      });

      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: res.data.answer,
        data: res.data.data,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Update context for follow-ups
      if (res.data.data?.bikes) {
        setContext({ lastBikes: res.data.data.bikes });
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: err.response?.data?.message || "I couldn't access the dealership data right now. Please try again.",
        data: null,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "ai",
        text: "Chat cleared. How can I help you?",
        data: null,
      },
    ]);
    setContext({});
    setShowSuggestions(true);
  };

  const actionLink = messages.length > 0 ? ACTION_LINKS[messages[messages.length - 1].data?.type] : null;
  const actionLabel = messages.length > 0 ? ACTION_LABELS[messages[messages.length - 1].data?.type] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-dark-border bg-surface-alt dark:bg-dark-surface">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <FaRobot className="text-primary" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-heading dark:text-dark-text-heading">Ask BinAthar AI</h3>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">Dealership Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-surface dark:hover:bg-dark-surface-alt text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text transition-colors"
            title="Clear conversation"
          >
            <FaTrash size={14} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface dark:hover:bg-dark-surface-alt text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text transition-colors"
              title="Close"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <FaRobot className="text-primary" size={13} />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-md"
                  : msg.isError
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-bl-md"
                  : "bg-white dark:bg-dark-surface-alt border border-border dark:border-dark-border text-text dark:text-dark-text rounded-bl-md"
              }`}
            >
              {msg.role === "ai" ? (
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-surface-alt dark:bg-dark-surface flex items-center justify-center shrink-0 mt-0.5">
                <FaUser className="text-text-muted dark:text-dark-text-muted" size={12} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FaRobot className="text-primary" size={13} />
            </div>
            <div className="bg-white dark:bg-dark-surface-alt border border-border dark:border-dark-border rounded-xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-text-muted dark:text-dark-text-muted">
                <FaSpinner className="animate-spin" size={13} />
                <span className="text-sm">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!loading && messages.length > 1 && actionLink && actionLabel && (
          <div className="flex justify-center">
            <Link
              to={actionLink}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg transition-colors no-underline"
            >
              <FaMotorcycle size={12} /> {actionLabel}
            </Link>
          </div>
        )}

        {/* Suggested Questions */}
        {showSuggestions && suggestions && !loading && (
          <div className="space-y-3 pt-2">
            {suggestions.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-medium text-text-muted dark:text-dark-text-muted mb-2 flex items-center gap-1.5">
                  {group.category === "Inventory" && <FaMotorcycle size={10} />}
                  {group.category === "Sales" && <FaChartBar size={10} />}
                  {group.category === "Customer Interest" && <FaComments size={10} />}
                  {group.category === "Management" && <FaCog size={10} />}
                  {group.category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 text-xs bg-surface-alt dark:bg-dark-surface border border-border dark:border-dark-border rounded-full text-text dark:text-dark-text hover:border-primary hover:text-primary transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border dark:border-dark-border bg-surface-alt dark:bg-dark-surface">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about inventory, sales, inquiries..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white transition-colors"
          >
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
