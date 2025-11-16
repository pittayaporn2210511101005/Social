// src/services/api.js

// ==================== CONFIG ====================
export const API_BASE   = import.meta.env.VITE_API_BASE   || "http://localhost:8082";
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";

const CREDENTIALS = "same-origin";

// ==================== HELPERS ====================
function joinPath(...parts) {
    return (
        "/" +
        parts
            .filter(Boolean)
            .map((p) => String(p).replace(/^\/+|\/+$/g, ""))  // ตัด / หน้า-หลัง
            .join("/")
    );
}

function toQuery(params = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
            q.set(k, v);
        }
    });
    return q.toString();
}

async function http(method, path, { params, body } = {}) {
    const qs  = toQuery(params);
    const url = `${API_BASE}${path}${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        credentials: CREDENTIALS,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new Error(`API Error ${res.status}`);
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? await res.json() : null;
}

const get  = (path, params) => http("GET",  path, { params });
const post = (path, body)  => http("POST", path, { body });

// Path helper → สร้าง prefix อัตโนมัติ
const p = (sub) => joinPath(API_PREFIX, sub);

// ==================== REAL APIs ====================

// ------ Dashboard ดึงผลวิเคราะห์ ------
export function getTweetAnalysis(params = {}) {
    return get(p("/analysis"), params);
}

// ------ Dashboard ดึงวันที่ทั้งหมด ------
export function getTweetDates(params = {}) {
    return get(p("/tweet-dates"), params);
}

// ------ Settings ------
export function getSettings() {
    return get(p("/settings"));
}

export function updateSettings(payload) {
    const body = {
        ...payload,
        theme: payload?.theme === "DARK" ? "DARK" : "LIGHT",
        notificationsEnabled: !!payload?.notificationsEnabled,
        negativeThreshold:
            payload?.negativeThreshold != null ? Number(payload.negativeThreshold) : 20,
        sources: Array.isArray(payload?.sources) ? payload.sources : [],
    };
    return put(p("/settings"), body);
}

// ------ Alerts ------
export function postScanAlerts() {
    return post(p("/alerts/scan"));
}

export function postTestMail() {
    return post(p("/alerts/test"));
}
