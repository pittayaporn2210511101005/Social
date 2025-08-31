import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Homepage.css"; // ใช้โทนเดียวกับหน้าโฮม

function Settings() {
    // ------------ ค่าเริ่มต้น (mock) ------------
    const defaultConfig = {
        theme: "light",                     // light | dark (mock)
        notifyEmail: true,
        notifyThreshold: 20,                // แจ้งเตือนเมื่อมีลบเกิน %
        sources: {                          // แหล่งข้อมูลที่จะเก็บ (สาธารณะ)
            news: true,
            forums: true,
            youtube: false,
            tiktok: false,
            blogs: true,
        },
        facultyScope: "ทั้งหมด",            // ขอบเขตการวิเคราะห์
    };

    const [config, setConfig] = useState(defaultConfig);
    const [savedNote, setSavedNote] = useState("");

    // โหลดค่าจาก localStorage (ถ้ามี)
    useEffect(() => {
        const raw = localStorage.getItem("utcc_social_settings");
        if (raw) {
            try {
                setConfig({ ...defaultConfig, ...JSON.parse(raw) });
            } catch (_) {}
        }
    }, []);

    const saveConfig = () => {
        localStorage.setItem("utcc_social_settings", JSON.stringify(config));
        setSavedNote("บันทึกการตั้งค่าเรียบร้อย (Mock)");
        setTimeout(() => setSavedNote(""), 1800);
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
                    <Link to="/sentiment" className="nav-item">
                        <i className="fas fa-smile"></i>
                        <span>Sentiment</span>
                    </Link>
                    <Link to="/trends" className="nav-item">
                        <i className="fas fa-stream"></i>
                        <span>Trends</span>
                    </Link>
                    <Link to="/settings" className="nav-item active">
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                    </Link>
                </nav>
            </div>

            {/* Main */}
            <div className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 className="header-title">Settings</h1>
                        <div className="sub-note" style={{ color: "#666" }}>
                            * หน้านี้เป็นการตั้งค่าแบบ <b>Mock</b> — เก็บไว้ใน localStorage เท่านั้น
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="search-bar">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search in settings" />
                        </div>
                        <div className="profile-icon">
                            <i className="fas fa-user-circle"></i>
                        </div>
                    </div>
                </header>

                <main className="widgets-grid">
                    {/* Theme */}
                    <section className="widget-card">
                        <h3 className="widget-title">Theme</h3>
                        <div className="chart-placeholder" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    type="radio"
                                    name="theme"
                                    checked={config.theme === "light"}
                                    onChange={() => setConfig({ ...config, theme: "light" })}
                                />
                                โทนสว่าง (ฟ้า/เทาอ่อน)
                            </label>
                            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    type="radio"
                                    name="theme"
                                    checked={config.theme === "dark"}
                                    onChange={() => setConfig({ ...config, theme: "dark" })}
                                />
                                โทนเข้ม (Dark/Night)
                            </label>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="widget-card">
                        <h3 className="widget-title">Notifications</h3>
                        <div className="chart-placeholder" style={{ display: "grid", gap: 12 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={config.notifyEmail}
                                    onChange={(e) => setConfig({ ...config, notifyEmail: e.target.checked })}
                                />
                                ส่งอีเมลแจ้งเตือน (Mock)
                            </label>
                            <div>
                                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                                    แจ้งเตือนเมื่อสัดส่วน <b>Negative</b> มากกว่า (%)
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={config.notifyThreshold}
                                    onChange={(e) =>
                                        setConfig({ ...config, notifyThreshold: Number(e.target.value) || 0 })
                                    }
                                    style={{
                                        width: 120,
                                        padding: "8px 10px",
                                        borderRadius: 8,
                                        border: "1px solid #ddd",
                                        background: "#fff",
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Sources */}
                    <section className="widget-card">
                        <h3 className="widget-title">Data Sources (Public)</h3>
                        <div className="chart-placeholder" style={{ display: "grid", gap: 10 }}>
                            {Object.entries(config.sources).map(([key, val]) => (
                                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={val}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                sources: { ...config.sources, [key]: e.target.checked },
                                            })
                                        }
                                    />
                                    {key}
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Faculty Scope */}
                    <section className="widget-card">
                        <h3 className="widget-title">ขอบเขตการวิเคราะห์</h3>
                        <div className="chart-placeholder" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <select
                                value={config.facultyScope}
                                onChange={(e) => setConfig({ ...config, facultyScope: e.target.value })}
                                style={{
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #ddd",
                                    background: "#fff",
                                }}
                            >
                                <option>ทั้งหมด</option>
                                <option>คณะบริหารธุรกิจ</option>
                                <option>คณะวิทยาศาสตร์ฯ (CS)</option>
                                <option>คณะนิติศาสตร์</option>
                                <option>คณะบัญชี</option>
                            </select>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="widget-card" style={{ alignSelf: "start" }}>
                        <h3 className="widget-title">Actions</h3>
                        <div className="chart-placeholder" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <button
                                onClick={saveConfig}
                                style={{
                                    background: "#0d47a1",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "8px 14px",
                                    cursor: "pointer",
                                }}
                            >
                                Save Settings
                            </button>
                            <button
                                onClick={() => {
                                    setConfig(defaultConfig);
                                    localStorage.removeItem("utcc_social_settings");
                                }}
                                style={{
                                    background: "#e0e0e0",
                                    color: "#111",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "8px 14px",
                                    cursor: "pointer",
                                }}
                            >
                                Reset
                            </button>
                            <span style={{ color: "#2e7d32", fontSize: 12 }}>{savedNote}</span>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Settings;
