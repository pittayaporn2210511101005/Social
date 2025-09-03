// src/Homepage.jsx
import React, { useMemo, useState } from "react";
import "./Homepage.css";
import { Link } from "react-router-dom";

// services + hook (โหลดข้อมูลจาก API จริง ถ้าไม่พร้อมจะ fallback ไปที่ public/mocks)
import { getMentions, getMentionsTrend } from "./services/api";
import { useFetch } from "./hooks/useFetch";

// Recharts สำหรับกราฟเส้น
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function Homepage() {
    // ---------- state สำหรับตาราง mentions ----------
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // ---------- state สำหรับค้นหา/ฟิลเตอร์ ----------
    const [q, setQ] = useState("");
    const [faculty, setFaculty] = useState("ทั้งหมด");
    const [sent, setSent] = useState("ทั้งหมด");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const faculties = useMemo(
        () => [
            "ทั้งหมด",
            "คณะบริหารธุรกิจ",
            "คณะวิทยาศาสตร์ฯ (CS)",
            "คณะนิติศาสตร์",
            "คณะบัญชี",
            "บริการ/สิ่งอำนวยความสะดวก",
        ],
        []
    );

    // ---------- build query string ----------
    const qs = useMemo(() => {
        const params = new URLSearchParams({
            page: String(page),
            page_size: String(pageSize),
            q,
            faculty: faculty === "ทั้งหมด" ? "" : faculty,
            sentiment: sent === "ทั้งหมด" ? "" : sent,
            from,
            to,
        });
        return `?${params.toString()}`;
    }, [page, pageSize, q, faculty, sent, from, to]);

    // ดึงรายการ mentions (ตาราง)
    const { data, loading, err } = useFetch(() => getMentions(qs), [qs]);
    const items = data?.items || [];
    const total = data?.total ?? items.length;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    // ดึงข้อมูล trend สำหรับกราฟเส้น
    const {
        data: trendData,
        loading: loadingTrend,
        err: errTrend,
    } = useFetch(() => getMentionsTrend(), []);
    const trend = (trendData?.points ?? []).map((d) => ({
        date: d.date,
        count: d.count,
    }));

    // ---------- Reset filters ----------
    const resetFilters = () => {
        setQ("");
        setFaculty("ทั้งหมด");
        setSent("ทั้งหมด");
        setFrom("");
        setTo("");
        setPage(1);
    };

    // ---------- Export CSV (ส่งออกเฉพาะรายการที่กำลังแสดง) ----------
    function downloadCSV(rows, filename = "mentions.csv") {
        const headers = ["title", "faculty", "sentiment", "date", "url"];
        const csv = [
            headers.join(","),
            ...rows.map((r) =>
                headers
                    .map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`)
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ---------- Export CSV (ทั้งชุดตามฟิลเตอร์ปัจจุบัน) ----------
    async function exportAllCSV() {
        const params = new URLSearchParams({
            page: "1",
            page_size: "1000", // ปรับตามขนาดชุดข้อมูลที่ต้องการ
            q,
            faculty: faculty === "ทั้งหมด" ? "" : faculty,
            sentiment: sent === "ทั้งหมด" ? "" : sent,
            from,
            to,
        });
        const res = await getMentions(`?${params.toString()}`);
        const rows = res?.items || res || [];
        downloadCSV(rows, "mentions_all.csv");
    }

    return (
        <div className="homepage-container">
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
                    {/* Dashboard */}
                    <Link to="/dashboard" className="nav-item">
                        <i className="far fa-chart-line"></i>
                        <span>Dashboard</span>
                    </Link>

                    {/* Mentions */}
                    <Link to="/mentions" className="nav-item active">
                        <i className="fas fa-comment-dots"></i>
                        <span>Mentions</span>
                    </Link>

                    {/* Sentiment */}
                    <Link to="/sentiment" className="nav-item">
                        <i className="fas fa-smile"></i>
                        <span>Sentiment</span>
                    </Link>

                    {/* Trends */}
                    <Link to="/trends" className="nav-item">
                        <i className="fas fa-stream"></i>
                        <span>Trends</span>
                    </Link>

                    {/* Settings */}
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
                        <h1 className="header-title">Mentions</h1>
                    </div>
                    <div className="header-right">
                        {/* Search */}
                        <div className="search-bar">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search"
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="profile-icon">
                            <i className="fas fa-user-circle"></i>
                        </div>
                    </div>
                </header>

                {/* ฟิลเตอร์เพิ่มเติมเหนือสารบัญ */}
                <section className="widget-card" style={{ marginBottom: 16 }}>
                    <h3 className="widget-title">ตัวกรอง</h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                            gap: 12,
                        }}
                    >
                        <div>
                            <label style={{ fontSize: 12, color: "#666" }}>คณะ/สาขา</label>
                            <select
                                value={faculty}
                                onChange={(e) => {
                                    setFaculty(e.target.value);
                                    setPage(1);
                                }}
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

                        <div>
                            <label style={{ fontSize: 12, color: "#666" }}>Sentiment</label>
                            <select
                                value={sent}
                                onChange={(e) => {
                                    setSent(e.target.value);
                                    setPage(1);
                                }}
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #ddd",
                                    background: "#fff",
                                }}
                            >
                                <option>ทั้งหมด</option>
                                <option value="positive">positive</option>
                                <option value="neutral">neutral</option>
                                <option value="negative">negative</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: 12, color: "#666" }}>จากวันที่</label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => {
                                    setFrom(e.target.value);
                                    setPage(1);
                                }}
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #ddd",
                                    background: "#fff",
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: 12, color: "#666" }}>ถึงวันที่</label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => {
                                    setTo(e.target.value);
                                    setPage(1);
                                }}
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #ddd",
                                    background: "#fff",
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <button
                            onClick={resetFilters}
                            style={{
                                background: "#e0e0e0",
                                color: "#111",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 14px",
                                cursor: "pointer",
                            }}
                        >
                            รีเซ็ตตัวกรอง
                        </button>
                    </div>
                </section>

                {/* Widgets */}
                <main className="widgets-grid">
                    <div className="widget-card widget-sentiment">
                        <h3 className="widget-title">Sentiment Overview</h3>
                        <div className="chart-placeholder">ใส่วงกลมแนวโน้ม</div>
                    </div>

                    {/* กราฟเส้น Mention Trends (Recharts) */}
                    <div className="widget-card widget-mentions-trend">
                        <h3 className="widget-title">Mention Trends</h3>
                        {errTrend ? (
                            <div className="chart-placeholder">โหลดข้อมูลไม่สำเร็จ</div>
                        ) : loadingTrend ? (
                            <div className="chart-placeholder">กำลังโหลด…</div>
                        ) : trend.length === 0 ? (
                            <div className="chart-placeholder">ไม่มีข้อมูล</div>
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

                    <div className="widget-card widget-hashtags">
                        <h3 className="widget-title">Top Hashtags</h3>
                        <div className="chart-placeholder">แฮชแท็กยอดนิยม</div>
                    </div>

                    <div className="widget-metrics">
                        <div className="metric-card">
                            <div className="metric-header">
                <span className="metric-title">
                  Total Mentions (การกล่าวถึงทั้งหมด)
                </span>
                            </div>
                            <div className="metric-content">
                                <span className="metric-value">{loading ? "…" : total}</span>
                                <div className="metric-graph"></div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-header">
                <span className="metric-title">
                  Engagement Rate (อัตราการมีส่วนร่วม)
                </span>
                            </div>
                            <div className="metric-content">
                                <span className="metric-value">—</span>
                                <div className="metric-graph"></div>
                            </div>
                        </div>
                    </div>

                    {/* ตาราง Mentions + Pagination + Export CSV / Export All */}
                    <div className="widget-card" style={{ gridColumn: "span 2" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h3 className="widget-title">Mentions (Mock/API)</h3>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    onClick={() => downloadCSV(items)}
                                    style={{
                                        background: "var(--secondary-color)",
                                        color: "var(--dark-text)",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "8px 14px",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                    }}
                                >
                                    Export CSV
                                </button>
                                <button
                                    onClick={exportAllCSV}
                                    style={{
                                        background: "var(--secondary-color)",
                                        color: "var(--dark-text)",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "8px 14px",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                    }}
                                >
                                    Export All
                                </button>
                            </div>
                        </div>

                        {err && (
                            <div style={{ color: "#c62828", marginBottom: 10 }}>
                                โหลดข้อมูลไม่สำเร็จ: {String(err)}
                            </div>
                        )}

                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด…</div>
                        ) : (
                            <>
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
                                            <div>{m.sentiment}</div>
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

                                {/* Pagination */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                        marginTop: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        Prev
                                    </button>
                                    <span>
                    Page {page} / {maxPage}
                  </span>
                                    <button
                                        disabled={page >= maxPage}
                                        onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}

                        <div
                            className="mock-hint"
                            style={{ marginTop: 8, color: "#666", fontSize: 12 }}
                        >
                            * ถ้า API ยังไม่พร้อม ระบบจะใช้ไฟล์ mock ใน <code>public/mocks</code>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Homepage;
