import React, { useEffect, useState } from "react";
import { getTwitterAnalysis } from "./services/api";

export default function AnalysisList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");

    async function load() {
        setLoading(true);
        try {
            const data = await getTwitterAnalysis({ keyword });
            setRows(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Twitter Analysis (จาก DB)</h2>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                    placeholder="ค้นหาคีย์เวิร์ด (ถ้ามี)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ padding: 6, border: "1px solid #ccc" }}
                />
                <button onClick={load} style={{ padding: "6px 12px" }}>โหลดข้อมูล</button>
            </div>

            {loading ? (
                <div>กำลังโหลด...</div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ minWidth: 900, width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ background: "#f7f7f7" }}>
                        <tr>
                            <th style={th}>Tweet ID</th>
                            <th style={th}>Sentiment</th>
                            <th style={th}>Toxicity</th>
                            <th style={th}>NSFW</th>
                            <th style={th}>Faculty</th>
                            <th style={th}>Topics</th>
                            <th style={th}>Analyzed At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((it) => (
                            <tr key={it.tweetId}>
                                <td style={td}>{it.tweetId}</td>
                                <td style={td}>
                                    {it.sentimentLabel} ({Number(it.sentimentScore ?? 0).toFixed(2)})
                                </td>
                                <td style={td}>{Number(it.toxicityScore ?? 0).toFixed(2)}</td>
                                <td style={td}>
                                    {it.nsfwLabel} ({Number(it.nsfwScore ?? 0).toFixed(2)})
                                </td>
                                <td style={td}>{it.faculty || "-"}</td>
                                <td style={td}>{(it.topics || []).join(", ") || "-"}</td>
                                <td style={td}>
                                    {it.analyzedAt ? new Date(it.analyzedAt).toLocaleString() : "-"}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td style={{ ...td, textAlign: "center" }} colSpan={7}>
                                    ไม่มีข้อมูลอนาไลซิส (ลองกด “โหลดข้อมูล” หรือเรียก /api/twitter/analysis/run ที่หลังบ้าน)
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const th = { border: "1px solid #ddd", textAlign: "left", padding: 8 };
const td = { border: "1px solid #eee", textAlign: "left", padding: 8 };
