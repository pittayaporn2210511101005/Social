// src/Homepage.jsx
import React, { useMemo, useState } from "react";
import "./Homepage.css";
import { Link } from "react-router-dom";

// API จริง
import { getTweetAnalysis } from "./services/api";
import { useFetch } from "./hooks/useFetch";

// components เดิม (ยังใช้ต่อได้)
import FiltersBar from "./components/FiltersBar";
import SentimentOverview from "./components/SentimentOverview";
import MentionsTrend from "./components/MentionsTrend";
import MetricsRow from "./components/MetricsRow";
import MentionsTable from "./components/MentionsTable";
import { downloadCSV } from "./utils/csv";

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

    // ---------- fetch ข้อมูลจริง ----------
    const { data, loading, err } = useFetch(() => getTweetAnalysis(), []);
    const rows = data || [];

    // ---------- utils ----------
    const normSent = (s = "") => {
        const x = s.toLowerCase();
        if (x === "pos" || x === "positive") return "positive";
        if (x === "neg" || x === "negative") return "negative";
        return "neutral";
    };
    const pickDate = (r) =>
        (r.analyzedAt || r.createdAt || r.crawlTime || "")
            .toString()
            .slice(0, 10);

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
            const topics =
                Array.isArray(r.topics) && r.topics.length
                    ? r.topics.join(" ")
                    : (r.topicsJson || "")
                        .toString()
                        .split(",")
                        .map((x) => x.trim())
                        .join(" ");
            const hay = `${topics} ${r.faculty || ""} ${r.sentimentLabel || ""} ${
                r.tweetId || ""
            } ${r.text || ""}`;
            return hay.toLowerCase().includes(qq);
        });
    }, [rows, q, faculty, sent, from, to]);

    // ---------- map สำหรับตาราง ----------
    const mappedItems = useMemo(
        () =>
            filtered.map((r, idx) => {
                const topics =
                    Array.isArray(r.topics) && r.topics.length
                        ? r.topics
                        : (r.topicsJson || "")
                            .toString()
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean);

                const title = topics.length
                    ? topics.join(", ")
                    : r.text
                        ? r.text.length > 80
                            ? r.text.slice(0, 80) + "…"
                            : r.text
                        : `Tweet ${r.tweetId || r.id || idx}`;

                return {
                    id: r.id ?? r.tweetId ?? idx,
                    title,
                    faculty: r.faculty || "-",
                    sentiment: normSent(r.sentimentLabel),
                    date: pickDate(r),
                    url: r.tweetId ? `https://x.com/i/web/status/${r.tweetId}` : "#",
                };
            }),
        [filtered]
    );

    // ---------- pagination ----------
    const total = mappedItems.length;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return mappedItems.slice(start, start + pageSize);
    }, [mappedItems, page, pageSize]);

    // ---------- summary (pie + kpi) ----------
    const { pos, neu, neg } = useMemo(() => {
        let p = 0,
            n = 0,
            g = 0;
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

    // ---------- handlers ----------
    const resetFilters = () => {
        setQ("");
        setFaculty("ทั้งหมด");
        setSent("ทั้งหมด");
        setFrom("");
        setTo("");
        setPage(1);
    };
    const exportAllCSV = () => downloadCSV(mappedItems, "mentions_all.csv");

    // ---------- KPI card helper ----------
    const fmtPct = (v, base) =>
        base ? `${Math.round((v / base) * 100)}%` : "0%";

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

            {/* Main */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 className="header-title">Mentions</h1>
                        <div className="subhead">
                            ผลลัพธ์ทั้งหมด <b>{total.toLocaleString()}</b>{" "}
                            รายการ {from || to ? `· ช่วง ${from || "เริ่มต้น"} - ${to || "ล่าสุด"}` : ""}
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="toolbar">
                            <button className="btn ghost" onClick={resetFilters}>
                                รีเซ็ตตัวกรอง
                            </button>
                            <button className="btn primary" onClick={exportAllCSV}>
                                Export ทั้งหมด
                            </button>
                        </div>
                        <div className="profile-icon">
                            <i className="fas fa-user-circle"></i>
                        </div>
                    </div>
                </header>

                {/* Filter bar (sticky) */}
                <div className="filters-sticky">
                    <FiltersBar
                        q={q}
                        setQ={(v) => {
                            setQ(v);
                            setPage(1);
                        }}
                        faculty={faculty}
                        setFaculty={(v) => {
                            setFaculty(v);
                            setPage(1);
                        }}
                        sent={sent}
                        setSent={(v) => {
                            setSent(v);
                            setPage(1);
                        }}
                        from={from}
                        setFrom={(v) => {
                            setFrom(v);
                            setPage(1);
                        }}
                        to={to}
                        setTo={(v) => {
                            setTo(v);
                            setPage(1);
                        }}
                        faculties={faculties}
                        onReset={resetFilters}
                    />
                </div>

                {/* KPI cards */}
                <section className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-title">Total</div>
                        <div className="kpi-value">
                            {loading ? "…" : total.toLocaleString()}
                        </div>
                    </div>
                    <div className="kpi-card pos">
                        <div className="kpi-title">Positive</div>
                        <div className="kpi-value">{pos}</div>
                        <div className="kpi-sub">{fmtPct(pos, total)}</div>
                    </div>
                    <div className="kpi-card neu">
                        <div className="kpi-title">Neutral</div>
                        <div className="kpi-value">{neu}</div>
                        <div className="kpi-sub">{fmtPct(neu, total)}</div>
                    </div>
                    <div className="kpi-card neg">
                        <div className="kpi-title">Negative</div>
                        <div className="kpi-value">{neg}</div>
                        <div className="kpi-sub">{fmtPct(neg, total)}</div>
                    </div>
                </section>

                {/* Widgets */}
                <main className="widgets-grid">
                    <SentimentOverview data={sentimentData} loading={loading} error={err} />
                    <MentionsTrend data={trend} loading={loading} error={err} />

                    {/* เดิม: แสดง metric สรุป */}
                    <MetricsRow total={total} loading={loading} />

                    <MentionsTable
                        items={pageItems}
                        error={err}
                        loading={loading}
                        page={page}
                        maxPage={maxPage}
                        setPage={setPage}
                        onExportAll={exportAllCSV}
                    />
                </main>
            </div>
        </div>
    );
}

export default Homepage;
