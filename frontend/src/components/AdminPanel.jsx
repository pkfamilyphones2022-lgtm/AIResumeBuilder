import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Download,
  IndianRupee,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Zap
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ADMIN_TOKEN_KEY = "raa_admin_token";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatRateRs = (paise) => `Rs.${Number((Number(paise || 0) / 100).toFixed(2))}`;

export default function AdminPanel({ onBack }) {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || "");
  const [tokenInput, setTokenInput] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sendState, setSendState] = useState({});

  const headers = useMemo(() => ({ "x-admin-token": token }), [token]);

  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API}/admin/overview`, { headers });
      setData(response.data);
    } catch (err) {
      const message = err.response?.data?.error || "Unable to load admin dashboard.";
      setData(null);
      setError(message);
      if (err.response?.status === 401 || err.response?.status === 503) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken("");
        setTokenInput("");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const saveToken = (event) => {
    event.preventDefault();
    const nextToken = tokenInput.trim();
    setData(null);
    setError("");
    localStorage.setItem(ADMIN_TOKEN_KEY, nextToken);
    setToken(nextToken);
  };

  const sendResume = async (item) => {
    setSendState((current) => ({ ...current, [item.resumeId]: "sending" }));
    try {
      await axios.post(
        `${API}/admin/resumes/${item.resumeId}/send`,
        { note: "Sent by ResumeAlignAI support because the payment was successful." },
        { headers }
      );
      setSendState((current) => ({ ...current, [item.resumeId]: "sent" }));
      await loadDashboard();
    } catch (err) {
      setSendState((current) => ({
        ...current,
        [item.resumeId]: err.response?.data?.error || "failed"
      }));
    }
  };

  const recent = useMemo(() => {
    const list = data?.recent || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      [
        item.userName,
        item.userEmail,
        item.userPhone,
        item.paymentStatus,
        item.orderId,
        item.paymentId,
        String(item.resumeId)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [data, query]);

  if (!token) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <button className="admin-back-link" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="admin-login-mark">
            <ShieldCheck size={26} />
          </div>
          <h1>Admin Access</h1>
          <p>Enter the admin token configured on the backend to view payments, downloads, resumes, and support actions.</p>
          {error && <p className="admin-login-error">{error}</p>}
          <form onSubmit={saveToken}>
            <input
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="Admin access token"
            />
            <button type="submit">Open Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <div className="admin-login-mark">
            <ShieldCheck size={26} />
          </div>
          <h1>Checking Access</h1>
          <p>Please wait while we verify your admin token.</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <button className="admin-back-link" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to site
          </button>
          <h1>Admin Dashboard</h1>
          <p>Payments, resume generation, downloads, email support, and paid sessions that need help.</p>
        </div>
        <div className="admin-topbar-actions">
          <button onClick={loadDashboard} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            className="admin-ghost-button"
            onClick={() => {
              localStorage.removeItem(ADMIN_TOKEN_KEY);
              setToken("");
              setData(null);
            }}
          >
            Lock
          </button>
        </div>
      </header>

      {error && <p className="admin-error">{error}</p>}

      <section className="admin-metrics-grid">
        <div className="admin-metric">
          <span><UserCheck size={18} /></span>
          <p>Resumes Created</p>
          <strong>{summary.resumesCreated || 0}</strong>
        </div>
        <div className="admin-metric">
          <span><IndianRupee size={18} /></span>
          <p>Revenue</p>
          <strong>Rs.{summary.revenueRs || 0}</strong>
        </div>
        <div className="admin-metric">
          <span><IndianRupee size={18} /></span>
          <p>AI Cost</p>
          <strong>Rs.{summary.aiCostRs || 0}</strong>
        </div>
        <div className="admin-metric admin-metric-profit">
          <span><IndianRupee size={18} /></span>
          <p>Gross Profit</p>
          <strong>Rs.{summary.profitRs || 0}</strong>
        </div>
        <div className="admin-metric">
          <span><IndianRupee size={18} /></span>
          <p>Successful Payments</p>
          <strong>{summary.successfulPayments || 0}</strong>
        </div>
        <div className="admin-metric admin-metric-warn">
          <span><ShieldCheck size={18} /></span>
          <p>Paid Not Downloaded</p>
          <strong>{summary.paidNotDownloaded || 0}</strong>
        </div>
        <div className="admin-metric">
          <span><Download size={18} /></span>
          <p>Downloads</p>
          <strong>{summary.downloads || 0}</strong>
        </div>
        <div className="admin-metric">
          <span><Mail size={18} /></span>
          <p>Emails Sent</p>
          <strong>{summary.emailsSent || 0}</strong>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2><Zap size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />Token Usage by Model</h2>
            <p>Cumulative token consumption and estimated cost broken down by AI provider and model.</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Model</th>
                <th>Requests</th>
                <th>Generate</th>
                <th>Improve</th>
                <th>Suggest</th>
                <th>Prompt Tokens</th>
                <th>Completion Tokens</th>
                <th>Total Tokens</th>
                <th>Cost (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {(data?.modelUsage || []).length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", color: "var(--text-muted, #888)" }}>No AI usage recorded yet.</td></tr>
              ) : (
                (data?.modelUsage || []).map((row) => (
                  <tr key={`${row.provider}-${row.model}`}>
                    <td><span className={`admin-pill ${row.provider}`}>{row.provider}</span></td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{row.model}</td>
                    <td><strong>{row.requests}</strong></td>
                    <td>{row.generateCount}</td>
                    <td>{row.improveCount}</td>
                    <td>{row.suggestCount}</td>
                    <td>{(row.promptTokens || 0).toLocaleString("en-IN")}</td>
                    <td>{(row.completionTokens || 0).toLocaleString("en-IN")}</td>
                    <td><strong>{(row.totalTokens || 0).toLocaleString("en-IN")}</strong></td>
                    <td><strong>Rs.{row.costRs ?? 0}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2>AI Pricing Used</h2>
            <p>These are the live cost assumptions used for admin AI cost and gross profit. Update backend env when provider pricing or USD/INR changes.</p>
          </div>
        </div>
        <div className="admin-pricing-grid">
          <div className="admin-price-card">
            <strong>DeepSeek</strong>
            <span>{data?.pricing?.deepseek?.model}</span>
            <p>Cache hit input: {formatRateRs(data?.pricing?.deepseek?.cacheHitInput)} / 1M</p>
            <p>Cache miss input: {formatRateRs(data?.pricing?.deepseek?.cacheMissInput)} / 1M</p>
            <p>Output: {formatRateRs(data?.pricing?.deepseek?.output)} / 1M</p>
          </div>
          <div className="admin-price-card">
            <strong>Groq</strong>
            <span>{data?.pricing?.groq?.model}</span>
            <p>Input: {formatRateRs(data?.pricing?.groq?.input)} / 1M</p>
            <p>Output: {formatRateRs(data?.pricing?.groq?.output)} / 1M</p>
          </div>
          <div className="admin-price-card">
            <strong>Anthropic</strong>
            <span>{data?.pricing?.anthropic?.model}</span>
            <p>Input: {formatRateRs(data?.pricing?.anthropic?.input)} / 1M</p>
            <p>Output: {formatRateRs(data?.pricing?.anthropic?.output)} / 1M</p>
          </div>
          <div className="admin-price-card">
            <strong>FX Rate</strong>
            <span>USD to INR</span>
            <p>Using Rs.{data?.pricing?.usdToInr || 94.3} per $1</p>
            <p>Rates are stored as paise per 1M tokens.</p>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2>Day-Wise Status</h2>
            <p>Daily resume creation, payment status, revenue, downloads, and email activity.</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Created</th>
                <th>Success</th>
                <th>Pending</th>
                <th>Failed</th>
                <th>Revenue</th>
                <th>AI Cost</th>
                <th>Profit</th>
                <th>Downloads</th>
                <th>Email Sent</th>
                <th>Email Failed</th>
              </tr>
            </thead>
            <tbody>
              {(data?.daily || []).map((day) => (
                <tr key={day.date}>
                  <td>{formatDate(day.date)}</td>
                  <td>{day.resumesCreated}</td>
                  <td>{day.paymentSuccess}</td>
                  <td>{day.paymentPending}</td>
                  <td>{day.paymentFailed}</td>
                  <td>Rs.{day.revenue || 0}</td>
                  <td>Rs.{day.aiCostRs || 0}</td>
                  <td>Rs.{day.profitRs || 0}</td>
                  <td>{day.downloads}</td>
                  <td>{day.emailsSent}</td>
                  <td>{day.emailsFailed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2>Customer Sessions</h2>
            <p>Use resend when payment is successful but the user session timed out or download did not happen.</p>
          </div>
          <label className="admin-search">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, order, resume ID" />
          </label>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-session-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Resume</th>
                <th>Payment</th>
                <th>AI Cost</th>
                <th>Downloads</th>
                <th>Email</th>
                <th>Created</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={`${item.resumeId}-${item.orderId || "no-payment"}`} className={item.needsSupport ? "needs-support" : ""}>
                  <td>
                    <strong>{item.userName || "Unknown"}</strong>
                    <span>{item.userEmail || "No email"}</span>
                    <small>{item.userPhone || ""}</small>
                  </td>
                  <td>
                    <strong>#{item.resumeId}</strong>
                    <span>ATS {item.atsScore || "-"}</span>
                    <small>{item.resumeStatus || "generated"}</small>
                  </td>
                  <td>
                    <span className={`admin-pill ${item.paymentStatus || "none"}`}>{item.paymentStatus || "no payment"}</span>
                    <small>{item.amountRs ? `Rs.${item.amountRs}` : "-"}</small>
                    <small>Profit Rs.{item.profitRs || 0}</small>
                  </td>
                  <td>
                    <strong>Rs.{item.aiCostRs || 0}</strong>
                    <span>{item.aiTokens || 0} tokens</span>
                  </td>
                  <td>
                    <strong>{item.downloadCount || 0}</strong>
                    <span>{formatDateTime(item.lastDownloadedAt)}</span>
                  </td>
                  <td>
                    <span>{item.emailsSent || 0} sent</span>
                    <small>{item.emailsFailed || 0} failed</small>
                  </td>
                  <td>{formatDateTime(item.resumeCreatedAt)}</td>
                  <td>
                    <button
                      className="admin-send-button"
                      disabled={item.paymentStatus !== "success" || !item.userEmail || sendState[item.resumeId] === "sending"}
                      onClick={() => sendResume(item)}
                    >
                      <Mail size={14} />
                      {sendState[item.resumeId] === "sending"
                        ? "Sending"
                        : sendState[item.resumeId] === "sent"
                        ? "Sent"
                        : "Send Resume"}
                    </button>
                    {sendState[item.resumeId] && !["sending", "sent"].includes(sendState[item.resumeId]) && (
                      <small className="admin-send-error">{sendState[item.resumeId]}</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
