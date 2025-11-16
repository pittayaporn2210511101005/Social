// src/components/ExportButtons.jsx
import { downloadCSV } from "../utils/csv";

export default function ExportButtons({ currentRows, onExportAll }) {
    return (
        <div style={{ display:"flex", gap:8 }}>
            <button
                onClick={()=> downloadCSV(currentRows)}
                style={{ background:"var(--secondary-color)", color:"var(--dark-text)", border:"none", borderRadius:8, padding:"8px 14px", cursor:"pointer", fontWeight:700 }}
            >
                Export CSV
            </button>
            <button
                onClick={onExportAll}
                style={{ background:"var(--secondary-color)", color:"var(--dark-text)", border:"none", borderRadius:8, padding:"8px 14px", cursor:"pointer", fontWeight:700 }}
            >
                Export All
            </button>
        </div>
    );
}
