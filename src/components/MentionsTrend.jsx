// src/components/MentionsTrend.jsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function MentionsTrend({ data, loading, error }) {
    return (
        <div className="widget-card widget-mentions-trend">
            <h3 className="widget-title">Mention Trends</h3>
            {error ? <div className="chart-placeholder">โหลดข้อมูลไม่สำเร็จ</div> :
                loading ? <div className="chart-placeholder">กำลังโหลด…</div> :
                    data.length === 0 ? <div className="chart-placeholder">ไม่มีข้อมูล</div> :
                        <div style={{ height:260, background:"var(--light-bg)", borderRadius:10, padding:10 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(v)=>v} domain={[0, "auto"]} />
                                    <Tooltip formatter={(v)=> [`${v} mentions`, "Count"]} />
                                    <Line type="monotone" dataKey="count" stroke="#FF5722" dot={{ r:4, fill:"#FF5722" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>}
        </div>
    );
}
