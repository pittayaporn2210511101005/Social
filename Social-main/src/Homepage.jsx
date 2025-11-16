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
    } catch (_) {}
  }
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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

/* ====== ผู้ใช้ปัจจุบัน + Modal ประวัติ ====== */
const CURRENT_USER_NAME = "Demo Admin";

function HistoryModal({ open, onClose, items = [], postId }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 className="modal-title">ประวัติการแก้ไขโพสต์ {postId}</h3>

        {items.length === 0 ? (
          <div className="modal-empty">ยังไม่มีประวัติการแก้ไข</div>
        ) : (
          <ul className="history-list">
            {items.map((h, idx) => (
              <li key={idx} className="history-item">
                <div className="history-main">
                  <span className="history-field">
                    {h.type === "sentiment" ? "Sentiment" : "Tag"}
                  </span>
                  <span className="history-from">{h.from || "-"}</span>
                  <span className="history-arrow">→</span>
                  <span className="history-to">{h.to || "-"}</span>
                </div>
                <div className="history-meta">
                  โดย <b>{h.user}</b> • {new Date(h.at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-footer">
          <button className="btn ghost" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====== Homepage ====== */
function Homepage() {
  // ---------- state ----------
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [q, setQ] = useState("");
  const [faculty, setFaculty] = useState("ทั้งหมด");
  const [sent, setSent] = useState("ทั้งหมด");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // state สำหรับ override sentiment + ประวัติ
  const [sentimentOverrides, setSentimentOverrides] = useState({});
  const [editHistory, setEditHistory] = useState({});
  const [historyFor, setHistoryFor] = useState(null);

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

    return rows.filter((r, idx) => {
      const fac = (r.faculty || "").trim();
      const id = r.id ?? idx;
      const baseSent = normSent(r.sentimentLabel);
      const s = sentimentOverrides[id] || baseSent;
      const dayStr = pickDate(r);
      const day = dayStr ? new Date(dayStr) : null;

      if (faculty !== "ทั้งหมด" && fac !== faculty) return false;
      if (sent !== "ทั้งหมด" && s !== sent) return false;
      if (fromD && day && day < fromD) return false;
      if (toD && day && day > toD) return false;

      if (!qq) return true;
      const topics = parseTopics(r).join(" ");
      const hay = `${topics} ${r.faculty || ""} ${
        r.sentimentLabel || ""
      } ${r.tweetId || ""} ${r.text || ""}`;
      return hay.toLowerCase().includes(qq);
    });
  }, [rows, q, faculty, sent, from, to, sentimentOverrides]);

  // ---------- map สำหรับตาราง ----------
  const mappedSentiment = useMemo(
    () =>
      filtered.map((r, i) => {
        const id = r.id ?? i;
        const topics = parseTopics(r);
        const baseSent = normSent(r.sentimentLabel);
        const finalSent = sentimentOverrides[id] || baseSent;

        return {
          id,
          tweetId: r.tweetId || "",
          faculty: r.faculty || "UNKNOWN",
          sentiment: finalSent,
          date: pickDate(r),
          topics,
          source: r.source || "X",
          nsfw: r.nsfw ? "Yes" : "No",
          toxic: r.toxic ? "Yes" : "No",
          url: r.tweetId ? `https://x.com/i/web/status/${r.tweetId}` : "#",
        };
      }),
    [filtered, sentimentOverrides]
  );

  // ---------- summary / KPI ----------
  const total = mappedSentiment.length;
  const { pos, neu, neg } = useMemo(() => {
    let p = 0,
      n = 0,
      g = 0;
    for (const m of mappedSentiment) {
      if (m.sentiment === "positive") p++;
      else if (m.sentiment === "negative") g++;
      else n++;
    }
    return { pos: p, neu: n, neg: g };
  }, [mappedSentiment]);

  const sentimentData = useMemo(
    () => [
      { name: "Positive", value: pos },
      { name: "Neutral", value: neu },
      { name: "Negative", value: neg },
    ],
    [pos, neu, neg]
  );

  // ---------- เปลี่ยน sentiment + บันทึกประวัติ ----------
  const handleSentimentChange = (id, oldSent, newSent) => {
    const from = normSent(oldSent);
    const to = normSent(newSent);
    if (from === to) return;

    setSentimentOverrides((prev) => ({
      ...prev,
      [id]: to,
    }));

    setEditHistory((prev) => {
      const list = prev[id] || [];
      return {
        ...prev,
        [id]: [
          ...list,
          {
            type: "sentiment",
            from,
            to,
            user: CURRENT_USER_NAME,
            at: new Date().toISOString(),
          },
        ],
      };
    });
  };

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

        {/* ===== ตาราง Sentiment ===== */}
        <section className="card">
          <h3 className="widget-title">
            รายการโพสต์ตาม Sentiment ({total})
          </h3>
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
                <div>จัดการ</div>
              </div>

              {mappedSentiment.map((m) => (
                <div className="t-row" key={m.id}>
                  <div>{m.id}</div>

                  <div className="topics" title={m.topics.join(", ")}>
                    {m.topics.length ? m.topics.join(", ") : "-"}
                  </div>

                  <div>{m.faculty}</div>

                  <div>
                    <div className="sentiment-edit">
                      <SentimentBadge value={m.sentiment} />
                      <select
                        className="sentiment-select"
                        value={m.sentiment}
                        onChange={(e) =>
                          handleSentimentChange(
                            m.id,
                            m.sentiment,
                            e.target.value
                          )
                        }
                      >
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                      </select>
                    </div>
                  </div>

                  <div>{m.source}</div>

                  <div className={m.nsfw === "Yes" ? "flag bad" : "flag ok"}>
                    {m.nsfw}
                  </div>

                  <div className={m.toxic === "Yes" ? "flag bad" : "flag ok"}>
                    {m.toxic}
                  </div>

                  <div>{m.date || "-"}</div>

                  {/* คอลัมน์ Link */}
                  <div>
                    {m.url && m.url !== "#" ? (
                      <a
                        className="link"
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        เปิดลิงก์
                      </a>
                    ) : (
                      <span className="link disabled">ไม่มีลิงก์</span>
                    )}
                  </div>

                  {/* คอลัมน์ จัดการ */}
                  <div className="manage-cell">
                    <button
                      type="button"
                      className="manage-link"
                      onClick={() => setHistoryFor(m.id)}
                    >
                      แก้ไข
                    </button>
                    <span className="manage-separator"> / </span>
                    <button
                      type="button"
                      className="manage-link"
                      onClick={() => {
                        alert("ฟีเจอร์ลบยังไม่ได้ทำจริง (แค่ UI)");
                      }}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal ประวัติ */}
        <HistoryModal
          open={historyFor !== null}
          postId={historyFor}
          items={historyFor != null ? editHistory[historyFor] || [] : []}
          onClose={() => setHistoryFor(null)}
        />
      </div>
    </div>
  );
}

export default Homepage;
