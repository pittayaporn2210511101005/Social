// src/Trends.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
// import "./Trends.css";               // ถ้าไม่มีไฟล์นี้ ให้ลบบรรทัด import ทิ้งได้
import { useFetch } from "./hooks/useFetch";
import { getTweetAnalysis } from "./services/api";

/** พยายามแปลง topicsJson ให้เป็น array ถ้าเป็น text จะดึง #hashtag ออกมา */
function toTopicsList(topicsJson) {
    if (!topicsJson) return [];
    // 1) ลอง parse เป็น JSON array ก่อน
    try {
        const js = JSON.parse(topicsJson);
        if (Array.isArray(js)) return js.filter(Boolean).map(String);
    } catch (_) {}
    // 2) ถ้าไม่ใช่ JSON: ดึง hashtags จากสตริง
    const tags = String(topicsJson).match(/#[\p{L}\d_]+/gu) || [];
    return tags.map(t => t.trim());
}

export default function Trends() {
    // ดึงข้อมูลจริงจากตาราง tweet_analysis
    const { data, loading, err } = useFetch(() => getTweetAnalysis(), []);
    const rows = data || [];

    // สร้าง Top Keywords และลิสต์โพสต์ล่าสุด
    const { topKeywords, trendingPosts } = useMemo(() => {
        // --------- นับคีย์เวิร์ด/แฮชแท็ก ---------
        const counter = new Map();
        for (const r of rows) {
            const topics = toTopicsList(r.topicsJson);
            for (const tRaw of topics) {
                const t = tRaw.toLowerCase();
                counter.set(t, (counter.get(t) || 0) + 1);
            }
        }
        const topKeywords = Array.from(counter.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // --------- โพสต์มาแรง (ล่าสุด) ----------
        const trendingPosts = [...rows]
            .sort((a, b) =>
                String(b.analyzedAt || "").localeCompare(String(a.analyzedAt || ""))
            )
            .slice(0, 5)
            .map((r) => ({
                id: r.id,
                title:
                    toTopicsList(r.topicsJson)[0] ||
                    (r.faculty ? `โพสต์เกี่ยวกับ ${r.faculty}` : `Tweet ${r.tweetId}`),
                date: r.analyzedAt ? String(r.analyzedAt).slice(0, 10) : "",
                url: r.tweetId ? `https://x.com/i/web/status/${r.tweetId}` : "#",
            }));

        return { topKeywords, trendingPosts };
    }, [rows]);

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
                        <i className="far fa-chart-line"></i><span>Dashboard</span>
                    </Link>
                    <Link to="/mentions" className="nav-item">
                        <i className="fas fa-comment-dots"></i><span>Mentions</span>
                    </Link>
                    <Link to="/sentiment" className="nav-item">
                        <i className="fas fa-smile"></i><span>Sentiment</span>
                    </Link>
                    <Link to="/trends" className="nav-item active">
                        <i className="fas fa-stream"></i><span>Trends</span>
                    </Link>
                    <Link to="/settings" className="nav-item">
                        <i className="fas fa-cog"></i><span>Settings</span>
                    </Link>
                </nav>
            </div>

            {/* Main */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 className="header-title">Trends</h1>
                        <div className="sub-note">* ดึงจากฐานข้อมูล tweet_analysis</div>
                    </div>
                </header>

                {err && (
                    <div className="widget-card" style={{ border: "1px solid #f44336", color: "#c62828" }}>
                        โหลดข้อมูลไม่สำเร็จ: {String(err)}
                    </div>
                )}

                <main className="widgets-grid">
                    {/* Top Keywords */}
                    <div className="widget-card">
                        <h3 className="widget-title">Top Keywords</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด…</div>
                        ) : topKeywords.length === 0 ? (
                            <div className="chart-placeholder">ไม่มีข้อมูล</div>
                        ) : (
                            <div>
                                {topKeywords.map((k) => (
                                    <div key={k.tag} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #eee"}}>
                                        <span>{k.tag}</span>
                                        <b>{k.count}</b>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trending Posts */}
                    <div className="widget-card" style={{ gridColumn: "span 2" }}>
                        <h3 className="widget-title">Trending Posts</h3>
                        {loading ? (
                            <div className="chart-placeholder">กำลังโหลด…</div>
                        ) : trendingPosts.length === 0 ? (
                            <div className="chart-placeholder">ไม่มีข้อมูล</div>
                        ) : (
                            <div className="table">
                                <div className="t-head">
                                    <div>Title</div>
                                    <div>Date</div>
                                    <div>Source</div>
                                </div>
                                {trendingPosts.map((p) => (
                                    <div className="t-row" key={p.id}>
                                        <div className="t-title" title={p.title}>{p.title}</div>
                                        <div>{p.date}</div>
                                        <div>
                                            <a href={p.url} target="_blank" rel="noreferrer">เปิดลิงก์</a>
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
