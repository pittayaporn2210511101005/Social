// src/Dashboard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { useFetch } from "./hooks/useFetch";
import { getTweetAnalysis } from "./services/api";

function SentimentBadge({ label }) {
    const lbl = (label || "").toLowerCase();
    const norm =
        lbl === "pos" || lbl === "positive"
            ? "positive"
            : lbl === "neg" || lbl === "negative"
                ? "negative"
                : "neutral";
    const cls =
        norm === "positive"
            ? "badge badge-pos"
            : norm === "negative"
                ? "badge badge-neg"
                : "badge badge-neu";
    return <span className={cls}>{norm}</span>;
}

export default function Dashboard() {
    // ดึงข้อมูลจริงจากตาราง tweet_analysis
    const { data, loading, err } = useFetch(() => getTweetAnalysis(), []);
    const rows = data || [];

    // ---- สรุปตัวเลข / top faculties / รายการล่าสุด ----
    const { totals, topFaculties, latestItems } = useMemo(() => {
        let pos = 0,
            neu = 0,
            neg = 0;

        const byFaculty = new Map(); // faculty -> count

        for (const r of rows) {
            const s = (r.sentimentLabel || "").toLowerCase();
            if (s === "pos" || s === "positive") pos++;
            else if (s === "neg" || s === "negative") neg++;
            else neu++;

            const fac = r.faculty || "UNKNOWN";
            byFaculty.set(fac, (byFaculty.get(fac) || 0) + 1);
        }

        const topFaculties = Array.from(byFaculty.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const latestItems = [...rows]
            .sort((a, b) =>
                String(b.analyzedAt || "").localeCompare(String(a.analyzedAt || ""))
            )
            .slice(0, 5)
            .map((r) => ({
                id: r.id,
                title: r.topicsJson || `Tweet ${r.tweetId || r.id}`,
                faculty: r.faculty || "-",
                sentiment: r.sentimentLabel || "-",
                date: r.analyzedAt ? String(r.analyzedAt).slice(0, 10) : "",
                url: r.tweetId ? `https://x.com/i/web/status/${r.tweetId}` : "#",
            }));

        return {
            totals: {
                mentions: rows.length,
                positive: pos,
                neutral: neu,
                negative: neg,
            },
            topFaculties,
            latestItems,
        };
    }, [rows]);

    return (
        <div className="dashboard-container">
            {/* แถบซ้าย */}
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
                        <i className="far fa-chart-line"></i>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/mentions" className="nav-item">
                        <i className="fas fa-comment-dots"></i>
                        <span>Mentions</span>
                    </Link>
                    <Link to="/sentiment" className="nav-item">
                        <i className="fas fa-smile"></i>
                        <span>Sentiment</span>
                    </Link>
                    <Link to="/trends" className="nav-item">
                        <i className="fas fa-stream"></i>
                        <span>Trends</span>
                    </Link>
                    <Link to="/settings" className="nav-item">
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                    </Link>
                </nav>
            </div>

            {/* เนื้อหาหลัก */}
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
                    <div
                        className="widget-card"
                        style={{ border: "1px solid #f44336", color: "#c62828" }}
                    >
                        โหลดข้อมูลไม่สำเร็จ: {String(err)}
                    </div>
                )}

                {/* วิดเจ็ต */}
                <main className="widgets-grid">
                    {/* Metrics */}
                    <div className="widget-metrics">
                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-title">Total Mentions</span>
                            </div>
                            <div className="metric-content">
                <span className="metric-value">
                  {loading ? "…" : totals.mentions.toLocaleString()}
                </span>
                                <div className="metric-graph" />
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-title">Positive / Neutral / Negative</span>
                            </div>
                            <div className="metric-content">
                <span className="metric-value">
                  {loading
                      ? "…"
                      : `${totals.positive} / ${totals.neutral} / ${totals.negative}`}
                </span>
                                <div className="metric-graph" />
                            </div>
                        </div>
                    </div>

                    {/* Sentiment Overview (ข้อความย่อ) */}
                    <div className="widget-card widget-sentiment">
                        <h3 className="widget-title">Sentiment Overview</h3>
                        <div className="chart-placeholder">
                            {loading
                                ? "กำลังโหลด..."
                                : `บวก ${totals.positive} | กลาง ${totals.neutral} | ลบ ${totals.negative}`}
                        </div>
                    </div>

                    {/* Mentions Trend (placeholder — จะต่อยอดภายหลังได้) */}
                    <div className="widget-card widget-mentions-trend">
                        <h3 className="widget-title">Mentions Trend</h3>
                        <div className="chart-placeholder">
                            {loading ? "กำลังโหลด..." : "เพิ่มกราฟจริงภายหลัง"}
                        </div>
                    </div>

                    {/* Top Faculties */}
                    <div className="widget-card widget-hashtags">
                        <h3 className="widget-title">Top Faculties</h3>
                        <div className="chart-placeholder">
                            {loading ? (
                                "กำลังโหลด..."
                            ) : topFaculties.length === 0 ? (
                                "ไม่มีข้อมูล"
                            ) : (
                                topFaculties.map((f) => (
                                    <div
                                        key={f.name}
                                        className="fac-row"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <span className="fac-name">{f.name}</span>
                                        <b className="fac-count">{f.count}</b>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Latest Mentions */}
                    <div className="widget-card">
                        <h3 className="widget-title">Latest Mentions</h3>
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

                                {latestItems.map((m) => (
                                    <div className="t-row" key={m.id}>
                                        <div className="t-title" title={m.title}>
                                            {m.title}
                                        </div>
                                        <div>{m.faculty}</div>
                                        <div>
                                            <SentimentBadge label={m.sentiment} />
                                        </div>
                                        <div>{m.date}</div>
                                        <div>
                                            <a href={m.url} target="_blank" rel="noreferrer">
                                                เปิดลิงก์
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                {latestItems.length === 0 && (
                                    <div style={{ color: "#777", padding: "10px 0" }}>
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
