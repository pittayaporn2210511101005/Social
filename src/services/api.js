// src/services/api.js
const BASE = import.meta.env.VITE_API_BASE || ""; // ใส่ URL หลังบ้านจริงใน .env ภายหลัง

async function tryJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Bad response");
    return res.json();
}

async function safeFetch(primaryFn, mockUrl) {
    try {
        // ลองเรียก API จริงก่อน
        return await primaryFn();
        // eslint-disable-next-line no-unused-vars
    } catch (_) {
        // ถ้า fail → ใช้ mock
        return await tryJson(mockUrl);
    }
}

/** SUMMARY */
export function getSummary() {
    return safeFetch(
        () => tryJson(`${BASE}/api/summary`),
        "/mocks/summary.json"
    );
}

/** MENTIONS */
export function getMentions(qs = "") {
    const suffix = qs.startsWith("?") ? qs : qs ? `?${qs}` : "";
    return safeFetch(
        () => tryJson(`${BASE}/api/mentions${suffix}`),
        "/mocks/mentions.json"
    );
}

/** SENTIMENT BY FACULTY */
export function getSentimentByFaculty() {
    return safeFetch(
        () => tryJson(`${BASE}/api/sentiment/faculty`),
        "/mocks/sentimentByFaculty.json"
    );
}

/** TRENDS (keywords + posts) */
export function getTrends() {
    return safeFetch(
        () => tryJson(`${BASE}/api/trends`),
        "/mocks/trends.json"
    );
}

/** ✅ MENTIONS TREND (สำหรับกราฟเส้นใน Homepage) */
export function getMentionsTrend() {
    return safeFetch(
        () => tryJson(`${BASE}/api/mentions/trend`),
        "/mocks/mentions_trend.json"
    );
}
