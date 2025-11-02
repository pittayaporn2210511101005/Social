// src/utils/csv.js
export function downloadCSV(rows, filename = "export.csv") {
    if (!rows || rows.length === 0) {
        const blob = new Blob(["No data"], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), { href: url, download: filename });
        a.click(); URL.revokeObjectURL(url);
        return;
    }
    const keys = Array.from(rows.reduce((s, r) => { Object.keys(r||{}).forEach(k=>s.add(k)); return s; }, new Set()));
    const header = keys.join(",");
    const body = rows.map(r => keys.map(k => {
        let v = r?.[k]; if (v == null) v = "";
        if (typeof v === "object") v = JSON.stringify(v);
        v = String(v).replace(/"/g,'""');
        return /[",\n]/.test(v) ? `"${v}"` : v;
    }).join(",")).join("\n");
    const blob = new Blob([header+"\n"+body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    a.click(); URL.revokeObjectURL(url);
}
