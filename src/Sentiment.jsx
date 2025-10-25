// src/Sentiment.jsx

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";

// services + hook (จะลอง API จริงก่อน ถ้าไม่ติดจะ fallback mock)
import { getSentimentSummary } from './services/api';
import { useFetch } from "./hooks/useFetch";
import Skeleton from "./components/Skeleton";


function Sentiment() {
    // ---------- ฟิลเตอร์ ----------
    const [selectedFaculty, setSelectedFaculty] = useState("ทั้งหมด");
    const [selectedSent, setSelectedSent] = useState("ทั้งหมด");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // ---------- ดึงข้อมูลสรุป sentiment ตามคณะ ----------
    const {
        data: byFaculty,
        loading: loadingFac,
        err: errFac,
    } = useFetch(() => getSentimentSummary(), []);


    // ---------- รายชื่อคณะ (ถ้า API มี ใช้อันนั้น, ไม่งั้น fallback) ----------
const faculties = useMemo(() => {
    if (Array.isArray(byFaculty)) {
      const list = byFaculty.map((f) => f.name).filter(Boolean);
      return ["ทั้งหมด", ...list];
    }
    // ถ้า API เป็น object เดี่ยว จะไม่มีรายชื่อคณะ
    return ["ทั้งหมด"];
  }, [byFaculty]);
  
  // ---------- ดึงรายการ mentions (รองรับภายหลังเมื่อ API filter ได้) ----------
  const qs = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedSent !== "ทั้งหมด") params.set("sentiment", selectedSent);
    if (selectedFaculty !== "ทั้งหมด") params.set("faculty", selectedFaculty);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    params.set("limit", "20");
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [selectedSent, selectedFaculty, dateFrom, dateTo]);
  

    const {
        data: mentionsData,
        loading: loadingMentions,
        err: errMentions,
    } = useFetch(() => getMentions(qs), [qs]);

    const mentions = mentionsData?.items || mentionsData || [];

    

    // ---------- สรุปด้านบน (total/pos/neu/neg) ----------
const totals = useMemo(() => {
    if (byFaculty) {
      // กรณี API ส่ง object เดียว
      return {
        total: (byFaculty.positive || 0) + (byFaculty.neutral || 0) + (byFaculty.negative || 0),
        positive: byFaculty.positive || 0,
        neutral: byFaculty.neutral || 0,
        negative: byFaculty.negative || 0
      }
    }
    const pos = mentions.filter((m) => m.sentiment === "positive").length;
    const neu = mentions.filter((m) => m.sentiment === "neutral").length;
    const neg = mentions.filter((m) => m.sentiment === "negative").length;
    return { total: mentions.length, positive: pos, neutral: neu, negative: neg }
  }, [byFaculty, mentions]);



    // ---------- กรองในฝั่งหน้า (ระหว่างรอ backend รองรับ params) ----------
    const filteredMentions = useMemo(() => {
        return mentions.filter((m) => {
            const fOK = selectedFaculty === "ทั้งหมด" || m.faculty === selectedFaculty;
            const sOK = selectedSent === "ทั้งหมด" || m.sentiment === selectedSent;
            const d = new Date(m.date);
            const f = dateFrom ? new Date(dateFrom) : null;
            const t = dateTo ? new Date(dateTo) : null;
            const dateOK = (!f || d >= f) && (!t || d <= t);
            return fOK && sOK && dateOK;
        });
    }, [mentions, selectedFaculty, selectedSent, dateFrom, dateTo]);

    const SentBadge = ({ label }) => {
        const cls =
            label === "positive"
                ? "badge badge-pos"
                : label === "negative"
                    ? "badge badge-neg"
                    : "badge badge-neu";
        return <span className={cls}>{label}</span>;
    };

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

            {/* Main */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 className="header-title">Sentiment</h1>
                        <div className="sub-note" style={{ color: "#666" }}>
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

                {/* ฟิลเตอร์ */}
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
                                className="form-control"
                                value={selectedFaculty}
                                onChange={(e) => setSelectedFaculty(e.target.value)}
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
                                className="form-control"
                                value={selectedSent}
                                onChange={(e) => setSelectedSent(e.target.value)}
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
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
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
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
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
                </section>

                {/* การ์ดสรุป */}
                <section className="widget-metrics" style={{ marginBottom: 16 }}>
                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-title">Total Mentions</span>
                        </div>
                        <div className="metric-content">
                            {loadingFac && loadingMentions ? (
                                <span className="metric-value">…</span>
                            ) : (
                                <span className="metric-value">{totals.total}</span>
                            )}
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-header">
                            <span className="metric-title">Positive / Neutral / Negative</span>
                        </div>
                        <div className="metric-content">
                            {loadingFac && loadingMentions ? (
                                <span className="metric-value">…</span>
                            ) : (
                                <span className="metric-value">
                  {totals.positive} / {totals.neutral} / {totals.negative}
                </span>
                            )}
                        </div>
                    </div>
                </section>

                {/* สัดส่วนตามคณะ */}
                <section className="widget-card" style={{ marginBottom: 16 }}>
                    <h3 className="widget-title">สัดส่วน Sentiment ตามคณะ</h3>
                    {loadingFac ? (
                        <Skeleton height={180} />
                    ) : errFac ? (
                        <div className="chart-placeholder" style={{ color: "#c62828" }}>
                            โหลดข้อมูลไม่สำเร็จ: {String(errFac)}
                        </div>
                    ) : byFaculty && byFaculty.length > 0 ? (
                        <div className="chart-placeholder" style={{ padding: 16 }}>
                            {byFaculty.map((f) => {
                                const total = (f.pos || 0) + (f.neu || 0) + (f.neg || 0) || 1;
                                const posW = Math.round(((f.pos || 0) / total) * 100);
                                const neuW = Math.round(((f.neu || 0) / total) * 100);
                                const negW = Math.round(((f.neg || 0) / total) * 100);
                                return (
                                    <div key={f.name} style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: 13, marginBottom: 6 }}>{f.name}</div>
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: `${posW}% ${neuW}% ${negW}%`,
                                                gap: 4,
                                                alignItems: "stretch",
                                            }}
                                        >
                                            <div
                                                title={`positive ${f.pos}`}
                                                style={{
                                                    background: "rgba(46, 125, 50, .25)",
                                                    border: "1px solid rgba(46,125,50,.35)",
                                                    height: 16,
                                                    borderRadius: 6,
                                                }}
                                            />
                                            <div
                                                title={`neutral ${f.neu}`}
                                                style={{
                                                    background: "rgba(249, 168, 37, .25)",
                                                    border: "1px solid rgba(249,168,37,.35)",
                                                    height: 16,
                                                    borderRadius: 6,
                                                }}
                                            />
                                            <div
                                                title={`negative ${f.neg}`}
                                                style={{
                                                    background: "rgba(198,40,40,.25)",
                                                    border: "1px solid rgba(198,40,40,.35)",
                                                    height: 16,
                                                    borderRadius: 6,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="chart-placeholder">ไม่มีข้อมูล</div>
                    )}
                </section>

                {/* ตารางรายการ */}
                <section className="widget-card">
                    <h3 className="widget-title">รายการล่าสุด</h3>
                    {errMentions && (
                        <div style={{ color: "#c62828", marginBottom: 10 }}>
                            โหลดข้อมูลไม่สำเร็จ: {String(errMentions)}
                        </div>
                    )}
                    {loadingMentions ? (
                        <div style={{ display: "grid", gap: 12 }}>
                            <Skeleton height={28} />
                            <Skeleton height={120} />
                            <Skeleton height={18} />
                        </div>
                    ) : (
                        <div className="table">
                            <div className="t-head">
                                <div>Title</div>
                                <div>Faculty</div>
                                <div>Sentiment</div>
                                <div>Date</div>
                                <div>Source</div>
                            </div>
                            {filteredMentions.map((m) => (
                                <div className="t-row" key={m.id}>
                                    <div className="t-title" title={m.title}>
                                        {m.title}
                                    </div>
                                    <div>{m.faculty}</div>
                                    <div>
                                        <SentBadge label={m.sentiment} />
                                    </div>
                                    <div>{m.date}</div>
                                    <div>
                                        <a href={m.url} target="_blank" rel="noreferrer">
                                            เปิดลิงก์
                                        </a>
                                    </div>
                                </div>
                            ))}
                            {filteredMentions.length === 0 && (
                                <div style={{ color: "#777", padding: "10px 0" }}>
                                    ไม่พบรายการตามตัวกรองที่เลือก
                                </div>
                            )}
                        </div>
                    )}
                    <div
                        className="mock-hint"
                        style={{ marginTop: 8, color: "#666", fontSize: 12 }}
                    >
                        * ถ้า API ยังไม่พร้อม ระบบจะใช้ไฟล์ mock ใน <code>public/mocks</code>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Sentiment;
