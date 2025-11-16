// ✅ src/components/MentionsTable.jsx
import React from "react";
import Pager from "./Pager";
import ExportButtons from "./ExportButtons";

export default function MentionsTable({
                                          items, error, loading,
                                          page, maxPage, setPage,
                                          onExportAll
                                      }) {
    return (
        <div className="widget-card" style={{ gridColumn:"span 2" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3 className="widget-title">รายการโพสต์ทั้งหมด</h3>
                <ExportButtons currentRows={items} onExportAll={onExportAll} />
            </div>

            {error && <div style={{ color:"#c62828", marginBottom:10 }}>โหลดข้อมูลไม่สำเร็จ: {String(error)}</div>}

            {loading ? (
                <div className="chart-placeholder">กำลังโหลดข้อมูล…</div>
            ) : (
                <>
                    <div className="table">
                        <div className="t-head">
                            <div>Title</div><div>Faculty</div><div>Sentiment</div><div>Date</div><div>Source</div>
                        </div>

                        {items.map(m => (
                            <div className="t-row" key={m.id}>
                                <div className="t-title" title={m.title}>{m.title}</div>
                                <div>{m.faculty}</div>
                                <div>{m.sentiment}</div>
                                <div>{m.date}</div>
                                <div><a href={m.url} target="_blank" rel="noreferrer">เปิดลิงก์</a></div>
                            </div>
                        ))}

                        {items.length === 0 && (
                            <div style={{ color:"#777", padding:"10px 0" }}>ไม่พบข้อมูล</div>
                        )}
                    </div>

                    <Pager page={page} maxPage={maxPage} setPage={setPage} />
                </>
            )}
        </div>
    );
}
