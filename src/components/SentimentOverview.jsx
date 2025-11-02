// src/components/SentimentOverview.jsx
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#2E7D32", "#F9A825", "#C62828"];

export default function SentimentOverview({ data, loading, error }) {
    return (
        <div className="widget-card widget-sentiment">
            <h3 className="widget-title">Sentiment Overview</h3>
            <div style={{ width:"100%", height:260 }}>
                {error ? <div className="chart-placeholder">โหลดไม่สำเร็จ</div> :
                    loading ? <div className="chart-placeholder">กำลังโหลด…</div> :
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {data.map((_, i)=><Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>}
            </div>
        </div>
    );
}
