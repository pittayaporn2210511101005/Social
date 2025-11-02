// src/Sentiment.jsx
import React, { useMemo, useState } from "react";
// import "./Sentiment.css";
import { Link } from "react-router-dom";
import { useFetch } from "./hooks/useFetch";
import { getTweetAnalysis } from "./services/api";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

export default function Sentiment() {
    const [faculty, setFaculty] = useState("ทั้งหมด");
    const faculties = [
        "ทั้งหมด",
        "คณะบริหารธุรกิจ",
        "คณะวิทยาศาสตร์ฯ (CS)",
        "คณะนิติศาสตร์",
        "คณะบัญชี",
        "บริการ/สิ่งอำนวยความสะดวก",
    ];

    // ดึงข้อมูลจริงจาก /analysis
    const { data, loading, err } = useFetch(() => getTweetAnalysis(), []);
    const rows = data || [];

    // กรองตามคณะ (ถ้ามีเลือก)
    const filtered = useMemo(() => {
        if (faculty === "ทั้งหมด") return rows;
        return rows.filter((r) => (r.faculty || "") === faculty);
    }, [rows, faculty]);

    // รวมสรุปจำนวน positive/neutral/negative
    const summary = useMemo(() => {
        let pos = 0,
            neu = 0,
            neg = 0;
        for (const r of filtered) {
            const s = (r.sentimentLabel || "").toLowerCase();
            if (s === "pos" || s === "positive") pos++;
            else if (s === "neg" || s === "negative") neg++;
            else neu++;
        }
        return { pos, neu, neg, total: filtered.length };
    }, [filtered]);

    // เตรียมข้อมูลสำหรับกราฟพาย
    const pieData = [
        { name: "Positive", value: summary.pos },
        { name: "Neutral", value: summary.neu },
        { name: "Negative", value: summary.neg },
    ];
    const COLORS = ["#2E7D32", "#F9A825", "#C62828"];

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
                    <Link to="/dashboard" className="nav-item">
                        <i className="far fa-chart-line"></i>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/mentions" className="nav-item">
                        <i className="fas fa-comment-dots"></i>
                        <span>Mentions</span>
                    </Link>
                    <Link to="/sentiment" className="nav-item active">
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
                        <h1 className="header-title">Sentiment</h1>
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
                    {/* ฟิลเตอร์คณะ */}
                    <div
                        className="widget-card"
                        style={{ marginBottom: 12, padding: 12, maxWidth: 320 }}
                    >
                        <label style={{ fontSize: 13, fontWeight: 600 }}>คณะ/สาขา</label>
                        <select
                            value={faculty}
                            onChange={(e) => e && setFaculty(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 8,
                                border: "1px solid #ddd",
                                background: "#fff",
                            }}
                        >
                            {faculties.map((f) => (
                                <option key={f} value={f}>
                                    {f}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* พายสรุป sentiment */}
                    <div className="widget-card widget-sentiment">
                        <h3 className="widget-title">Sentiment Overview</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด...</div>
                        ) : (
                            <div style={{ width: "100%", height: 260 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* ตารางรายละเอียด */}
                    <div className="widget-card" style={{ gridColumn: "span 2" }}>
                        <h3 className="widget-title">
                            รายการโพสต์ตาม Sentiment ({filtered.length})
                        </h3>

                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด...</div>
                        ) : (
                            <div className="table">
                                <div className="t-head">
                                    <div>ID</div>
                                    <div>Faculty</div>
                                    <div>Sentiment</div>
                                    <div>Analyzed At</div>
                                </div>

                                {filtered.map((r) => (
                                    <div className="t-row" key={r.id}>
                                        <div>{r.id}</div>
                                        <div>{r.faculty}</div>
                                        <div>{r.sentimentLabel}</div>
                                        <div>{String(r.analyzedAt).slice(0, 10)}</div>
                                    </div>
                                ))}

                                {filtered.length === 0 && (
                                    <div style={{ color: "#777", padding: "10px 0" }}>ไม่พบข้อมูล</div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
