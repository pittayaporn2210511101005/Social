// src/services/api.js

// ==================== CONFIG ====================
/**
 * ตั้งค่าผ่าน .env
 * VITE_API_BASE   = โฮสต์/พอร์ต backend (เช่น http://localhost:8082)
 * VITE_API_PREFIX = prefix path (เช่น "/api" หรือปล่อยว่าง "")
 * VITE_API_CRED   = "include" หากต้องการส่ง cookie
 */
export const API_BASE   = import.meta.env.VITE_API_BASE   || "http://localhost:8082";
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || "";
const CREDENTIALS =
    (import.meta.env.VITE_API_CRED || "").toLowerCase() === "include"
        ? "include"
        : "same-origin";

// ==================== HELPERS ====================
function joinPath(...parts) {
    return (
        "/" +
        parts
            .filter(Boolean)
            .map((p) => String(p).replace(/^\/+|\/+$/g, ""))
            .join("/")
    );
}

function toQuery(params = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") q.set(k, v);
    });
    return q.toString();
}

async function http(method, path, { params, body, timeoutMs = 15000 } = {}) {
    const qs  = toQuery(params);
    const url = `${API_BASE}${path}${qs ? `?${qs}` : ""}`;

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            method,
            signal: ac.signal,
            headers: body != null ? { "Content-Type": "application/json" } : undefined,
            credentials: CREDENTIALS,
            body: body != null ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            let msg = `${res.status} ${res.statusText}`;
            try {
                const text = await res.text();
                if (text) msg += ` — ${text}`;
            } catch {}
            throw new Error(msg);
        }

        const ct = res.headers.get("content-type") || "";
        return ct.includes("application/json") ? await res.json() : null;
    } finally {
        clearTimeout(timer);
    }
}

const get  = (path, params, opts) => http("GET",  path, { params, ...(opts || {}) });
const put  = (path, body,  opts) => http("PUT",  path, { body,  ...(opts || {}) });
const post = (path, body,  opts) => http("POST", path, { body,  ...(opts || {}) });

// path helper (รองรับมี/ไม่มี /api)
const p = (subPath) => joinPath(API_PREFIX, subPath);

// ==================== REAL APIs ====================

/** ดึงผลวิเคราะห์จากตาราง tweet_analysis */
export function getTweetAnalysis(params = {}) {
    return get(p("/analysis"), params);
}

/** อ่านการตั้งค่า */
export function getSettings() {
    return get(p("/settings"));
}

export async function getTweetDates() {
    const res = await fetch("http://localhost:8082/tweet-dates");
    if (!res.ok) throw new Error("โหลดวันที่ tweet ไม่ได้");
    return res.json();
  }
   
/** อัปเดตการตั้งค่า */
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

/** Alerts: สแกนและส่งแจ้งเตือนทันที (ตาม threshold) */
export function postScanAlerts() {
    return post(p("/alerts/scan"));
}

/** Alerts: ส่งอีเมลทดสอบ (ดูผลใน backend log) */
export function postTestMail() {
    return post(p("/alerts/test"));
}
