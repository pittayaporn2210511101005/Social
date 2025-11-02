// src/components/FiltersBar.jsx
export default function FiltersBar({
                                       q, setQ,
                                       faculty, setFaculty,
                                       sent, setSent,
                                       from, setFrom,
                                       to, setTo,
                                       faculties,
                                       onReset
                                   }) {
    return (
        <section className="widget-card" style={{ marginBottom: 16 }}>
            <h3 className="widget-title">ตัวกรอง</h3>

            <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr", gap:12 }}>
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search" value={q} onChange={(e)=> setQ(e.target.value)} />
                </div>

                <div>
                    <label style={{ fontSize:12, color:"#666" }}>คณะ/สาขา</label>
                    <select value={faculty} onChange={(e)=> setFaculty(e.target.value)} style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #ddd", background:"#fff" }}>
                        {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                <div>
                    <label style={{ fontSize:12, color:"#666" }}>Sentiment</label>
                    <select value={sent} onChange={(e)=> setSent(e.target.value)} style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #ddd", background:"#fff" }}>
                        <option>ทั้งหมด</option>
                        <option value="positive">positive</option>
                        <option value="neutral">neutral</option>
                        <option value="negative">negative</option>
                    </select>
                </div>

                <div style={{ display:"flex", gap:8 }}>
                    <div>
                        <label style={{ fontSize:12, color:"#666" }}>จากวันที่</label>
                        <input type="date" value={from} onChange={(e)=> setFrom(e.target.value)} style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #ddd", background:"#fff" }} />
                    </div>
                    <div>
                        <label style={{ fontSize:12, color:"#666" }}>ถึงวันที่</label>
                        <input type="date" value={to} onChange={(e)=> setTo(e.target.value)} style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #ddd", background:"#fff" }} />
                    </div>
                </div>
            </div>

            <div style={{ marginTop:10 }}>
                <button onClick={onReset} style={{ background:"#e0e0e0", color:"#111", border:"none", borderRadius:8, padding:"8px 14px", cursor:"pointer" }}>
                    รีเซ็ตตัวกรอง
                </button>
            </div>
        </section>
    );
}
