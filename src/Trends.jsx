// src/Trends.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Homepage.css"; // ใช้โทนเดียวกับหน้าโฮม
import { getTrends } from "./services/api";
import { useFetch } from "./hooks/useFetch";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function Trends() {
    // โหลดข้อมูล Trends (keywords + posts [+ trend ถ้ามี]) ผ่าน service
    const { data, loading, err } = useFetch(() => getTrends(), []);
    const keywords = data?.keywords ?? [];
    const posts = data?.posts ?? [];
    const trend = (data?.trend ?? []).map((d) => ({ date: d.date, count: d.count }));

    return (
        <div className="homepage-container">
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
                    <Link to="/dashboard" className="nav-item">
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
                    <Link to="/trends" className="nav-item active">
                        <i className="fas fa-stream"></i>
                        <span>Trends</span>
                    </Link>
                    <Link to="/settings" className="nav-item">
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 className="header-title">Trends</h1>
                        <div className="sub-note" style={{ color: "#666" }}>
                            * ดึงจาก API ถ้ามี, ไม่งั้นใช้ mock (public/mocks/trends.json)
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="search-bar">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search trends" />
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

                <main className="widgets-grid">
                    {/* Top Keywords */}
                    <div className="widget-card">
                        <h3 className="widget-title">Top Keywords</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด…</div>
                        ) : keywords.length === 0 ? (
                            <div className="chart-placeholder">ไม่มีข้อมูล</div>
                        ) : (
                            <div className="chart-placeholder" style={{ alignItems: "stretch" }}>
                                <div style={{ width: "100%" }}>
                                    {keywords.map((k) => (
                                        <div
                                            key={k.word}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr auto",
                                                gap: 8,
                                                alignItems: "center",
                                                marginBottom: 6,
                                            }}
                                        >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {k.word}
                      </span>
                                            <b>{k.count}</b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* กราฟเทรนด์รวม (LineChart) */}
                    <div className="widget-card">
                        <h3 className="widget-title">Mentions Trend</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด…</div>
                        ) : trend.length === 0 ? (
                            <div className="chart-placeholder">ไม่มีข้อมูล trend</div>
                        ) : (
                            <div
                                style={{
                                    height: 260,
                                    background: "var(--light-bg)",
                                    borderRadius: 10,
                                    padding: 10,
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trend}>
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="var(--primary-color)"
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Trending Posts */}
                    <div className="widget-card" style={{ gridColumn: "span 2" }}>
                        <h3 className="widget-title">Trending Posts</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด…</div>
                        ) : posts.length === 0 ? (
                            <div className="chart-placeholder">ไม่มีข้อมูล</div>
                        ) : (
                            <div className="table">
                                <div className="t-head">
                                    <div>Title</div>
                                    <div>Date</div>
                                    <div>Source</div>
                                </div>
                                {posts.map((p) => (
                                    <div className="t-row" key={p.id}>
                                        <div className="t-title" title={p.title}>
                                            {p.title}
                                        </div>
                                        <div>{p.date}</div>
                                        <div>
                                            <a href={p.url} target="_blank" rel="noreferrer">
                                                เปิดลิงก์
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Trends;
