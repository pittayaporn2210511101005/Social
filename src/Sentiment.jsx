// src/Sentiment.jsx
import React, { useMemo, useState } from "react";
import "./Sentiment.css";
import { Link } from "react-router-dom";
import { useFetch } from "./hooks/useFetch";
import { getTweetAnalysis } from "./services/api";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { downloadCSV } from "./utils/csv";

/* helpers */
const normSent = (s = "") => {
    const x = s.toLowerCase();
    if (x === "pos" || x === "positive") return "positive";
    if (x === "neg" || x === "negative") return "negative";
    return "neutral";
};
const pickDate = (r) =>
    (r.analyzedAt || r.createdAt || r.crawlTime || "").toString().slice(0, 10);
const parseTopics = (r) => {
    if (Array.isArray(r.topics) && r.topics.length) return r.topics;
    const tj = r.topicsJson;
    if (!tj) return [];
    const str = String(tj).trim();
    if (str.startsWith("[") || str.startsWith("{")) {
        try {
            const arr = JSON.parse(str);
            if (Array.isArray(arr)) return arr.map(String);
        } catch (_) {}
    }
    return str.split(",").map((s) => s.trim()).filter(Boolean);
};
function SentimentBadge({ value }) {
    const v = (value || "").toLowerCase();
    const cls =
        v === "positive"
            ? "pill pill-pos"
            : v === "negative"
                ? "pill pill-neg"
                : "pill pill-neu";
    return <span className={cls}>{v || "-"}</span>;
}

export default function Sentiment() {
    const { data, loading, err } = useFetch(() => getTweetAnalysis(), []);
    const rows = data || [];

    const [q, setQ] = useState("");
    const [faculty, setFaculty] = useState("ทั้งหมด");
    const [sent, setSent] = useState("ทั้งหมด");
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const faculties = useMemo(() => {
        const s = new Set(["ทั้งหมด"]);
        for (const r of rows) if (r?.faculty) s.add(r.faculty);
        return Array.from(s);
    }, [rows]);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return rows.filter((r) => {
            const s = normSent(r.sentimentLabel);
            const fac = r.faculty || "";
            if (faculty !== "ทั้งหมด" && fac !== faculty) return false;
            if (sent !== "ทั้งหมด" && s !== sent) return false;
            if (!qq) return true;
            const topics = parseTopics(r).join(" ");
            const hay = `${topics} ${fac} ${s} ${r.tweetId || ""} ${r.text || ""} ${r.source || ""}`;
            return hay.toLowerCase().includes(qq);
        });
    }, [rows, q, faculty, sent]);

    const mapped = useMemo(
        () =>
            filtered.map((r, i) => {
                const topics = parseTopics(r);
                return {
                    id: r.id ?? i,
                    tweetId: r.tweetId || "",
                    faculty: r.faculty || "UNKNOWN",
                    sentiment: normSent(r.sentimentLabel),
                    date: pickDate(r),
                    topics,
                    source: r.source || "X",
                    nsfw: r.nsfw ? "Yes" : "No",
                    toxic: r.toxic ? "Yes" : "No",
                    url: r.tweetId ? `https://x.com/i/web/status/${r.tweetId}` : "#",
                };
            }),
        [filtered]
    );

    const pieData = useMemo(() => {
        let pos = 0, neu = 0, neg = 0;
        for (const r of mapped) {
            if (r.sentiment === "positive") pos++;
            else if (r.sentiment === "negative") neg++;
            else neu++;
        }
        return [
            { name: "Positive", value: pos, color: "#22C55E" },
            { name: "Neutral", value: neu, color: "#FACC15" },
            { name: "Negative", value: neg, color: "#EF4444" },
        ];
    }, [mapped]);

    const total = mapped.length;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return mapped.slice(start, start + pageSize);
    }, [mapped, page]);

    const exportCSV = () => {
        const flat = mapped.map((m) => ({
            id: m.id,
            tweetId: m.tweetId,
            faculty: m.faculty,
            sentiment: m.sentiment,
            analyzedAt: m.date,
            topics: m.topics.join(" | "),
            source: m.source,
            nsfw: m.nsfw,
            toxic: m.toxic,
            url: m.url,
        }));
        downloadCSV(flat, "sentiment_report.csv");
    };

    return (
        <div className="sentiment-layout">{/* <== ทำให้เหมือนทุกหน้า */}
            {/* Sidebar (โทนเดียวกับหน้าอื่น) */}
            <aside className="sidebar">
                <div className="logo-container">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/th/f/f5/%E0%B8%95%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B8%AB%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%84%E0%B8%97%E0%B8%A2.svg"
                        width="100%" alt="UTCC"
                    />
                    <span className="logo-utcc"> UTCC </span>
                    <span className="logo-social"> Social</span>
                </div>

                <nav className="nav-menu">
                    <Link to="/dashboard" className="nav-item">
                        <i className="far fa-chart-line"></i><span>Dashboard</span>
                    </Link>
                    <Link to="/mentions" className="nav-item">
                        <i className="fas fa-comment-dots"></i><span>Mentions</span>
                    </Link>
                    <Link to="/sentiment" className="nav-item active">
                        <i className="fas fa-smile"></i><span>Sentiment</span>
                    </Link>
                    <Link to="/trends" className="nav-item">
                        <i className="fas fa-stream"></i><span>Trends</span>
                    </Link>
                    <Link to="/settings" className="nav-item">
                        <i className="fas fa-cog"></i><span>Settings</span>
                    </Link>
                </nav>
            </aside>

            {/* Content */}
            <main className="main-content">
                {/* Header */}
                <header className="page-header">
                    <div className="title-wrap">
                        <h1 className="page-title">Sentiment</h1>
                        <div className="page-sub">ทั้งหมด <b>{total.toLocaleString()}</b> รายการ</div>
                    </div>
                    <div className="actions">
                        <button
                            className="btn ghost"
                            onClick={() => { setQ(""); setFaculty("ทั้งหมด"); setSent("ทั้งหมด"); setPage(1); }}
                        >
                            รีเซ็ตตัวกรอง
                        </button>
                        <button className="btn primary" onClick={exportCSV}>Export CSV</button>
                    </div>
                </header>

                <div className="content-wrap">
                    {/* Filter + Pie */}
                    <section className="top-grid">
                        <div className="card filter-card">
                            <div className="filter-row">
                                <input
                                    className="search"
                                    placeholder="🔍 ค้นหา (หัวข้อ/คณะ/ที่มา/ข้อความ)"
                                    value={q}
                                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                                />
                                <select value={faculty} onChange={(e) => { setFaculty(e.target.value); setPage(1); }}>
                                    {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                                <select value={sent} onChange={(e) => { setSent(e.target.value); setPage(1); }}>
                                    <option>ทั้งหมด</option>
                                    <option value="positive">positive</option>
                                    <option value="neutral">neutral</option>
                                    <option value="negative">negative</option>
                                </select>
                            </div>
                        </div>

                        <div className="card pie-card">
                            <h3 className="widget-title">Sentiment Overview</h3>
                            {loading ? (
                                <div className="placeholder">กำลังโหลด...</div>
                            ) : (
                                <div style={{ width: "100%", height: 220 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                                                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            <div className="legend-inline">
                                <span className="dot pos" /> Positive
                                <span className="dot neu" /> Neutral
                                <span className="dot neg" /> Negative
                            </div>
                        </div>
                    </section>

                    {/* Table */}
                    <section className="card">
                        <h3 className="widget-title">รายการโพสต์ตาม Sentiment ({total})</h3>

                        {err && <div className="error-card">โหลดข้อมูลไม่สำเร็จ: {String(err)}</div>}

                        {loading ? (
                            <div className="placeholder">กำลังโหลด...</div>
                        ) : (
                            <>
                                <div className="table">
                                    <div className="t-head">
                                        <div>ID</div>
                                        <div>Topics</div>
                                        <div>Faculty</div>
                                        <div>Sentiment</div>
                                        <div>Source</div>
                                        <div>NSFW</div>
                                        <div>Toxic</div>
                                        <div>Analyzed At</div>
                                        <div>Link</div>
                                    </div>

                                    {pageItems.map((m) => (
                                        <div className="t-row" key={m.id}>
                                            <div>{m.id}</div>
                                            <div className="topics" title={m.topics.join(", ")}>
                                                {m.topics.length ? m.topics.join(", ") : "-"}
                                            </div>
                                            <div>{m.faculty}</div>
                                            <div><SentimentBadge value={m.sentiment} /></div>
                                            <div>{m.source}</div>
                                            <div className={m.nsfw === "Yes" ? "flag bad" : "flag ok"}>{m.nsfw}</div>
                                            <div className={m.toxic === "Yes" ? "flag bad" : "flag ok"}>{m.toxic}</div>
                                            <div>{m.date || "-"}</div>
                                            <div>
                                                {m.url && m.url !== "#" ? (
                                                    <a className="link" href={m.url} target="_blank" rel="noreferrer">เปิดลิงก์</a>
                                                ) : "-"}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pager">
                                    <button className="btn" disabled={page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Prev</button>
                                    <div className="page-ind">{page} / {maxPage}</div>
                                    <button className="btn" disabled={page >= maxPage}
                                            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}>Next ›</button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
