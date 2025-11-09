// src/Dashboard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { useFetch } from "./hooks/useFetch";
import { getTweetAnalysis } from "./services/api";

// Recharts
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";

/* ---------- theme colors (UTCC-ish) ---------- */
const COLORS = {
    blue: "#1E3A8A",
    yellow: "#FCD34D",
    green: "#22C55E",
    red: "#EF4444",
    gray: "#94A3B8",
    surface: "#F8FAFC",
};

/* ---------- small components ---------- */
function SentimentBadge({ label }) {
    const lbl = (label || "").toLowerCase();
    const norm =
        lbl === "pos" || lbl === "positive"
            ? "positive"
            : lbl === "neg" || lbl === "negative"
                ? "negative"
                : "neutral";
    const cls = `pill pill-${norm}`;
    return <span className={cls}>{norm}</span>;
}

/* ---------- helpers ---------- */
function tryParseJsonArray(str) {
    try {
        const v = JSON.parse(str);
        return Array.isArray(v) ? v : null;
    } catch {
        return null;
    }
}
function parseTopicsFromAny(r) {
    if (Array.isArray(r.topics) && r.topics.length) return r.topics; // DTO ใหม่
    if (r.topicsJson && /^[\[\{]/.test(String(r.topicsJson).trim())) {
        const arr = tryParseJsonArray(r.topicsJson);
        if (arr && arr.length) return arr.map(String);
    }
    if (r.topicsJson && typeof r.topicsJson === "string") {
        const arr = r.topicsJson.split(",").map((s) => s.trim()).filter(Boolean);
        if (arr.length) return arr;
    }
    return [];
}
const clip = (s, n = 60) => (s && s.length > n ? s.slice(0, n) + "…" : s || "-");

/* ===================================================== */

export default function Dashboard() {
    // อ่านจากฐานจริง
    const { data, loading, err } = useFetch(() => getTweetAnalysis(), []);
    const rows = data || [];

    /* ---------- normalize rows ---------- */
    const normRows = useMemo(() => {
        const arr = Array.isArray(rows) ? rows : [];
        return arr.map((r, idx) => {
            const topics = parseTopicsFromAny(r);
            const title =
                r.text
                    ? clip(r.text, 80)
                    : topics.length > 0
                        ? topics.join(", ")
                        : `Tweet ${r.tweetId || r.id || ""}`;


            const s = (r.sentimentLabel || r.sent || "").toLowerCase();
            const sentiment =
                s === "pos" || s === "positive"
                    ? "positive"
                    : s === "neg" || s === "negative"
                        ? "negative"
                        : "neutral";

            const rawDate = r.analyzedAt || r.createdAt || r.crawlTime || "";
            const date = rawDate ? String(rawDate).slice(0, 10) : "-";

            const tweetId = r.tweetId || r.id || String(idx);
            const url = tweetId ? `https://x.com/i/web/status/${tweetId}` : undefined;

            return {
                tweetId,
                title,
                faculty: r.faculty || "UNKNOWN",
                sentiment,
                date,
                source: r.source || "X",
                url,
            };
        });
    }, [rows]);

    /* ---------- totals / top fac / latest ---------- */
    const { totals, topFaculties, latestItems, sentShare } = useMemo(() => {
        let pos = 0, neu = 0, neg = 0;
        const byFaculty = new Map();

        for (const m of normRows) {
            if (m.sentiment === "positive") pos++;
            else if (m.sentiment === "negative") neg++;
            else neu++;

            const fac = m.faculty || "UNKNOWN";
            byFaculty.set(fac, (byFaculty.get(fac) || 0) + 1);
        }

        const total = normRows.length || 1;
        const sentShare = [
            { name: "Positive", value: pos, color: COLORS.green },
            { name: "Neutral", value: neu, color: COLORS.gray },
            { name: "Negative", value: neg, color: COLORS.red },
        ];

        const topFaculties = Array.from(byFaculty.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);


            //กรองไม่เอา unknown
            const latestItems = [...normRows]
            .filter(
                (m) =>
                    (m.sentiment === "positive" || m.sentiment === "negative") &&
                    m.faculty &&
                    m.faculty.toUpperCase() !== "UNKNOWN" // ✅ กรองไม่เอา UNKNOWN
            )
            .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
            .slice(0, 5);
        
    

        return {
            totals: { mentions: total, positive: pos, neutral: neu, negative: neg },
            topFaculties,
            latestItems,
            sentShare,
        };
    }, [normRows]);

    /* ---------- trend (mentions per day) ---------- */
const trendData = useMemo(() => {
    const byDay = new Map(); // yyyy-mm-dd -> count

    for (const m of normRows) {
        // ✅ ใช้ createdAt ก่อน ถ้าไม่มีค่อย fallback เป็น analyzedAt
        const rawDate = m.createdAt || m.analyzedAt || m.date;
        const dateStr = rawDate ? String(rawDate).slice(0, 10) : null;
        if (!dateStr) continue;

        byDay.set(dateStr, (byDay.get(dateStr) || 0) + 1);
    }

    return Array.from(byDay.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }));
}, [normRows]);


    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="logo-container">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/th/f/f5/%E0%B8%95%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B8%AB%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%84%E0%B8%97%E0%B8%A2.svg"
                        width="100%"
                        alt="UTCC"
                    />
                    <span className="logo-utcc"> UTCC </span>
                    <span className="logo-social"> Social</span>
                </div>

                <nav className="nav-menu">
                    <Link to="/dashboard" className="nav-item active">
                        <i className="far fa-chart-line"></i><span>Dashboard</span>
                    </Link>
                    <Link to="/mentions" className="nav-item">
                        <i className="fas fa-comment-dots"></i><span>Mentions</span>
                    </Link>
                     
                    <Link to="/trends" className="nav-item">
                        <i className="fas fa-stream"></i><span>Trends</span>
                    </Link>
                    <Link to="/settings" className="nav-item">
                        <i className="fas fa-cog"></i><span>Settings</span>
                    </Link>
                </nav>
            </div>

            {/* Main */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 className="header-title">Dashboard</h1>
                    </div>
                    <div className="header-right">
                        <div className="search-bar">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search" />
                        </div>
                        <div className="profile-icon">
                            <i className="fas fa-user-circle"></i>
                        </div>
                    </div>
                </header>

                {err && (
                    <div className="widget-card error-card">
                        โหลดข้อมูลไม่สำเร็จ: {String(err)}
                    </div>
                )}

                {/* Widgets */}
                <main className="widgets-grid">
                    {/* Metrics */}
                    <div className="widget-metrics">
                        {/* Total */}
                        <div className="metric-card">
                            <div className="metric-title">Total Mentions</div>
                            <div className="metric-value">
                                {loading ? "…" : totals.mentions.toLocaleString()}
                            </div>
                            <div className="metric-sub">
                                {loading ? "" : `POS ${totals.positive} · NEU ${totals.neutral} · NEG ${totals.negative}`}
                            </div>
                            <div className="progress">
                <span
                    className="bar bar-pos"
                    style={{ width: `${(totals.positive / (totals.mentions || 1)) * 100}%` }}
                />
                                <span
                                    className="bar bar-neu"
                                    style={{ width: `${(totals.neutral / (totals.mentions || 1)) * 100}%` }}
                                />
                                <span
                                    className="bar bar-neg"
                                    style={{ width: `${(totals.negative / (totals.mentions || 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Sentiment overview - Pie */}
                        <div className="metric-card">
                            <div className="metric-title">Sentiment Overview</div>
                            <div className="pie-wrap">
                                {loading ? (
                                    <div className="chart-placeholder">กำลังโหลด...</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={140}>
                                        <PieChart>
                                            <Pie
                                                data={sentShare}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={38}
                                                outerRadius={58}
                                                paddingAngle={2}
                                            >
                                                {sentShare.map((e, i) => (
                                                    <Cell key={i} fill={e.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            {!loading && (
                                <div className="legend-inline">
                                    <span className="dot" style={{ background: COLORS.green }} />
                                    POS &nbsp;&nbsp;
                                    <span className="dot" style={{ background: COLORS.gray }} />
                                    NEU &nbsp;&nbsp;
                                    <span className="dot" style={{ background: COLORS.red }} />
                                    NEG
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mentions Trend */}
                    <div className="widget-card">
                        <h3 className="widget-title">Mentions Trend</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด...</div>
                        ) : trendData.length === 0 ? (
                            <div className="chart-placeholder">ยังไม่มีข้อมูลวันที่</div>
                        ) : (
                            <div style={{ width: "100%", height: 220 }}>
                                <ResponsiveContainer>
                                    <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="count" strokeWidth={2} dot />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Top Faculties - Bar */}
                    <div className="widget-card">
                        <h3 className="widget-title">Top Faculties</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด...</div>
                        ) : (
                            <div style={{ width: "100%", height: 220 }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        data={[...topFaculties].reverse()} // ให้อันที่มากสุดอยู่บน
                                        layout="vertical"
                                        margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" width={120} />
                                        <Tooltip />
                                        <Bar dataKey="count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Latest Mentions */}
                    <div className="widget-card">
                        <h3 className="widget-title">Top 5 Positive & Negative Mentions</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด...</div>
                        ) : (
                            <div className="table">
                                <div className="t-head">
                                    <div>Title</div>
                                    <div>Faculty</div>
                                    <div>Sentiment</div>
                                    <div>Date</div>
                                    <div>Source</div>
                                </div>

                                {latestItems.map((m, index) => (
                                    <div className="t-row" key={m.tweetId || index}>
                                        <div className="t-title" title={m.title}>{clip(m.title, 50)}</div>
                                        <div>{m.faculty}</div>
                                        <div><SentimentBadge label={m.sentiment} /></div>
                                        <div>{m.date}</div>
                                        <div>
                                            {m.url ? (
                                                <a className="link" href={m.url} target="_blank" rel="noreferrer">
                                                    เปิดลิงก์
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {latestItems.length === 0 && (
                                    <div style={{ color: "#64748B", padding: "10px 0" }}>
                                        ไม่พบรายการ
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
