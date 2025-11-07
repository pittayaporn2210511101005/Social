// src/Homepage.jsx
import React, { useMemo, useState } from "react";
import "./Homepage.css";
import { Link } from "react-router-dom";

// API และ hook
import { getTweetAnalysis } from "./services/api";
import { useFetch } from "./hooks/useFetch";

// components เดิม
import FiltersBar from "./components/FiltersBar";
import SentimentOverview from "./components/SentimentOverview";
import MentionsTrend from "./components/MentionsTrend";
import MetricsRow from "./components/MetricsRow";
import MentionsTable from "./components/MentionsTable";
import { downloadCSV } from "./utils/csv";

/* ===== helper จาก Sentiment.jsx ===== */
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
        } catch (_) { }
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

function Homepage() {
    // ---------- state ----------
    const [page, setPage] = useState(1);
    const pageSize = 10;
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

    const { data, loading, err } = useFetch(() => getTweetAnalysis(), []);
    const rows = data || [];

    // ---------- filter ----------
    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        const fromD = from ? new Date(from) : null;
        const toD = to ? new Date(to) : null;

        return rows.filter((r) => {
            const fac = (r.faculty || "").trim();
            const s = normSent(r.sentimentLabel);
            const dayStr = pickDate(r);
            const day = dayStr ? new Date(dayStr) : null;

            if (faculty !== "ทั้งหมด" && fac !== faculty) return false;
            if (sent !== "ทั้งหมด" && s !== sent) return false;
            if (fromD && day && day < fromD) return false;
            if (toD && day && day > toD) return false;

            if (!qq) return true;
            const topics = parseTopics(r).join(" ");
            const hay = `${topics} ${r.faculty || ""} ${r.sentimentLabel || ""} ${r.tweetId || ""
                } ${r.text || ""}`;
            return hay.toLowerCase().includes(qq);
        });
    }, [rows, q, faculty, sent, from, to]);

    // ---------- summary ----------
    const total = filtered.length;
    const { pos, neu, neg } = useMemo(() => {
        let p = 0, n = 0, g = 0;
        for (const r of filtered) {
            const s = normSent(r.sentimentLabel);
            if (s === "positive") p++;
            else if (s === "negative") g++;
            else n++;
        }
        return { pos: p, neu: n, neg: g };
    }, [filtered]);

    const sentimentData = useMemo(
        () => [
            { name: "Positive", value: pos },
            { name: "Neutral", value: neu },
            { name: "Negative", value: neg },
        ],
        [pos, neu, neg]
    );

    // ---------- Sentiment รายละเอียด (มาจาก Sentiment.jsx) ----------
    const mappedSentiment = useMemo(() =>
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
                url: r.tweetId
                    ? `https://x.com/i/web/status/${r.tweetId}`
                    : "#",
            };
        }), [filtered]
    );

    const exportCSV = () => {
        const flat = mappedSentiment.map((m) => ({
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

    const resetFilters = () => {
        setQ("");
        setFaculty("ทั้งหมด");
        setSent("ทั้งหมด");
        setFrom("");
        setTo("");
        setPage(1);
    };

    // ---------- trend ----------
    const trend = useMemo(() => {
        const byDay = new Map();
        for (const r of filtered) {
            const d = pickDate(r);
            if (!d) continue;
            byDay.set(d, (byDay.get(d) || 0) + 1);
        }
        return Array.from(byDay.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({ date, count }));
    }, [filtered]);

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
                    <Link to="/mentions" className="nav-item active">
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

            {/* Main Content */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 className="header-title">Mentions & Sentiment</h1>
                        <div className="subhead">
                            ผลลัพธ์ทั้งหมด <b>{total.toLocaleString()}</b> รายการ
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="toolbar">
                            <button className="btn ghost" onClick={resetFilters}>
                                รีเซ็ตตัวกรอง
                            </button>
                            <button className="btn primary" onClick={exportCSV}>
                                Export CSV
                            </button>
                        </div>
                        <div className="profile-icon">
                            <i className="fas fa-user-circle"></i>
                        </div>
                    </div>
                </header>

                {/* Filter */}
                <div className="filters-sticky">
                    <FiltersBar
                        q={q}
                        setQ={setQ}
                        faculty={faculty}
                        setFaculty={setFaculty}
                        sent={sent}
                        setSent={setSent}
                        from={from}
                        setFrom={setFrom}
                        to={to}
                        setTo={setTo}
                        faculties={faculties}
                        onReset={resetFilters}
                    />
                </div>

                {/* KPI */}
                <section className="kpi-grid">
                    <div className="kpi-card pos">
                        <div className="kpi-title">Positive</div>
                        <div className="kpi-value">{pos}</div>
                    </div>
                    <div className="kpi-card neu">
                        <div className="kpi-title">Neutral</div>
                        <div className="kpi-value">{neu}</div>
                    </div>
                    <div className="kpi-card neg">
                        <div className="kpi-title">Negative</div>
                        <div className="kpi-value">{neg}</div>
                    </div>
                </section>

                {/* Chart */}
                <main className="widgets-grid">
                    <SentimentOverview data={sentimentData} loading={loading} error={err} />
                    <MentionsTrend data={trend} loading={loading} error={err} />
                    <MetricsRow total={total} loading={loading} />
                </main>

                {/* ===== ส่วนของหน้า Sentiment เพิ่มเข้ามา ===== */}
                <section className="card">
                    <h3 className="widget-title">รายการโพสต์ตาม Sentiment ({total})</h3>
                    {loading ? (
                        <div className="placeholder">กำลังโหลด...</div>
                    ) : (
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
                            {mappedSentiment.map((m) => (
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
                    )}
                </section>
            </div>
        </div>
    );
}

export default Homepage;
