// src/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css"; // โทนสีเดียวกับหน้าโฮม (อิงตัวแปร :root)
import { getSummary, getMentions } from "./services/api";
import { useFetch } from "./hooks/useFetch";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";


function SentimentBadge({ label }) {
    const cls =
        label === "positive"
            ? "badge badge-pos"
            : label === "negative"
                ? "badge badge-neg"
                : "badge badge-neu";
    return <span className={cls}>{label}</span>;
}

function Dashboard() {
    // ดึงข้อมูลผ่าน service (จะลอง API จริงก่อน ถ้าไม่ติดจะ fallback mock)
    const {
        data: summary,
        loading: loadingSummary,
        err: errSummary,
    } = useFetch(() => getSummary(), []);

    const {
        data: mentions,
        loading: loadingMentions,
        err: errMentions,
    } = useFetch(() => getMentions("?limit=5"), []);

    const loading = loadingSummary || loadingMentions;
    const error = errSummary || errMentions;

    const totals =
        summary?.totals ?? { mentions: 0, positive: 0, neutral: 0, negative: 0 };
    const topFaculties = summary?.topFaculties ?? [];

    const items = mentions?.items ?? mentions ?? [];

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

                {/* เมนูซ้าย: active = Dashboard */}
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

            {/* หน้าหลัก */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 className="header-title">Dashboard</h1>
                        <div className="sub-note">
                            * ดึงจาก API ถ้ามี, ไม่งั้นใช้ mock (public/mocks)
                        </div>
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

                {error && (
                    <div
                        className="widget-card"
                        style={{ border: "1px solid #f44336", color: "#c62828" }}
                    >
                        โหลดข้อมูลไม่สำเร็จ: {String(error)}
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
                                {loading ? (
                                    <span>กำลังโหลด...</span>
                                ) : (
                                    <span className="metric-value">
                    {totals.mentions.toLocaleString()}
                  </span>
                                )}
                                <div className="metric-graph" />
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                                <span className="metric-title">Positive / Neutral / Negative</span>
                            </div>
                            <div className="metric-content">
                                {loading ? (
                                    <span>กำลังโหลด...</span>
                                ) : (
                                    <span className="metric-value">
                    {totals.positive} / {totals.neutral} / {totals.negative}
                  </span>
                                )}
                                <div className="metric-graph" />
                            </div>
                        </div>
                    </div>

                    {/* Sentiment Overview */}
                    <div className="widget-card widget-sentiment">
                        <h3 className="widget-title">Sentiment Overview</h3>
                        <div className="chart-placeholder">
                            {loading
                                ? "กำลังโหลด..."
                                : `บวก ${totals.positive} | กลาง ${totals.neutral} | ลบ ${totals.negative}`}
                        </div>
                    </div>

                    {/* Mentions Trend (placeholder) */}
                    <div className="widget-card widget-mentions-trend">
                        <h3 className="widget-title">Mentions Trend</h3>
                        <div className="chart-placeholder">
                            {loading ? "กำลังโหลด..." : "ใส่กราฟจริงภายหลัง"}
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

                                {items.map((m) => (
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

                                {items.length === 0 && (
                                    <div style={{ color: "#777", padding: "10px 0" }}>
                                        ไม่พบรายการ
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mock-hint">
                            * ถ้า API ยังไม่พร้อม ระบบจะใช้ไฟล์ mock ใน <code>public/mocks</code>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
