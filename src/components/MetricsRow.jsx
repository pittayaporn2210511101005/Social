// src/components/MetricsRow.jsx
export default function MetricsRow({ total, loading }) {
    return (
        <div className="widget-metrics">
            <div className="metric-card">
                <div className="metric-header">
                    <span className="metric-title">Total Mentions (การกล่าวถึงทั้งหมด)</span>
                </div>
                <div className="metric-content">
                    <span className="metric-value">{loading ? "…" : total}</span>
                </div>
            </div>

            <div className="metric-card">
                <div className="metric-header">
                    <span className="metric-title">Engagement Rate (อัตราการมีส่วนร่วม)</span>
                </div>
                <div className="metric-content">
                    <span className="metric-value">—</span>
                </div>
            </div>
        </div>
    );
}
