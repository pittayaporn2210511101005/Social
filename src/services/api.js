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

/** SENTIMENT SUMMARY */
export function getSentimentSummary() {
    return safeFetch(
      () => tryJson("http://localhost:8082/sentiment/summary"),
      "/mocks/sentiment_summary.json"
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
