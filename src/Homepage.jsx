// src/Homepage.jsx
import React, { useMemo, useState } from "react";
import "./Homepage.css";
import { Link } from "react-router-dom";

// ✅ ใช้ API ใหม่ตัวเดียว
import { getTweetAnalysis } from "./services/api";
import { useFetch } from "./hooks/useFetch";

// components
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

    // ---------- fetch ข้อมูลจริงจาก /analysis ----------
    const { data, loading, err } = useFetch(() => getTweetAnalysis(), []);
    const rows = data || [];

    // ---------- filter + แปลงรูปร่างรายการให้เข้ากับตารางเดิม ----------
    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        const fromD = from ? new Date(from) : null;
        const toD = to ? new Date(to) : null;

        return rows.filter((r) => {
            const fac = (r.faculty || "").trim();
            const s = (r.sentimentLabel || "").toLowerCase();
            const day = r.analyzedAt ? new Date(r.analyzedAt) : null;

            if (faculty !== "ทั้งหมด" && fac !== faculty) return false;
            if (sent !== "ทั้งหมด" && s !== sent) return false;
            if (fromD && day && day < fromD) return false;
            if (toD && day && day > toD) return false;

            if (!qq) return true;
            const hay =
                (r.topicsJson || "") +
                " " +
                (r.faculty || "") +
                " " +
                (r.sentimentLabel || "") +
                " " +
                (r.tweetId || "");
            return hay.toLowerCase().includes(qq);
        });
    }, [rows, q, faculty, sent, from, to]);

    // map ให้เป็น shape ที่ MentionsTable ใช้ (title/faculty/sentiment/date/url)
    const mappedItems = useMemo(
        () =>
            filtered.map((r) => ({
                id: r.id,
                title: r.topicsJson || `Tweet ${r.tweetId || r.id}`,
                faculty: r.faculty || "-",
                sentiment: r.sentimentLabel || "-",
                date: r.analyzedAt ? String(r.analyzedAt).slice(0, 10) : "",
                url: r.tweetId ? `https://x.com/i/web/status/${r.tweetId}` : "#",
            })),
        [filtered]
    );

    // ---------- pagination ----------
    const total = mappedItems.length;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return mappedItems.slice(start, start + pageSize);
    }, [mappedItems, page, pageSize]);

    // ---------- summary (pie) ----------
    const sentimentData = useMemo(() => {
        let pos = 0,
            neu = 0,
            neg = 0;
        for (const r of filtered) {
            const s = (r.sentimentLabel || "").toLowerCase();
            if (s === "pos" || s === "positive") pos++;
            else if (s === "neg" || s === "negative") neg++;
            else neu++;
        }
        return [
            { name: "Positive", value: pos },
            { name: "Neutral", value: neu },
            { name: "Negative", value: neg },
        ];
    }, [filtered]);

    // ---------- trend (line) : group by day ----------
    const trend = useMemo(() => {
        const byDay = new Map();
        for (const r of filtered) {
            const day = r.analyzedAt ? String(r.analyzedAt).slice(0, 10) : "";
            if (!day) continue;
            byDay.set(day, (byDay.get(day) || 0) + 1);
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

    const exportAllCSV = () => {
        downloadCSV(mappedItems, "mentions_all.csv");
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
                    </div>
                    <div className="header-right">
                        <div className="profile-icon">
                            <i className="fas fa-user-circle"></i>
                        </div>
                    </div>
                </header>

                {/* Filter bar */}
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

                {/* Dashboard Widgets */}
                <main className="widgets-grid">
                    <SentimentOverview data={sentimentData} loading={loading} error={err} />
                    <MentionsTrend data={trend} loading={loading} error={err} />
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
