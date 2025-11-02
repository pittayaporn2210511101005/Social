// src/services/api.js
export const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:8082";

/* ---------------- helpers ---------------- */
function toQuery(params = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") q.set(k, v);
    });
    return q.toString();
}

async function get(path, params = {}, { timeoutMs = 15000 } = {}) {
    const qs = toQuery(params);
    const url = `${API_BASE}${path}${qs ? `?${qs}` : ""}`;

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);

    try {
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return await res.json();
    } finally {
        clearTimeout(t);
    }
}

/* ---------------- API (จริง) ---------------- */
/**
 * ดึงผลวิเคราะห์ทวีตจากตาราง tweet_analysis
 * รองรับตัวกรองแบบง่าย ๆ (ฝั่งหน้าเว็บจะกรองเพิ่มเองก็ได้)
 * @param {Object} params
 *   - keyword?   (string)
 *   - sentiment? ("pos"|"neu"|"neg")
 *   - faculty?   (string)
 */
export async function getTweetAnalysis(params = {}) {
    // ตอนนี้ backend เปิด GET /analysis แบบรวม
    // ถ้าภายหลังรองรับ query string ก็ส่ง params ไปได้เลย
    return get("/analysis", params);
}
