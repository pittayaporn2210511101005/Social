// ใช้ class บน <body> เพื่อเปลี่ยนชุดสีทั้งเว็บ
export function applyTheme(theme) {
    const t = (theme || "LIGHT").toUpperCase();
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(t === "DARK" ? "theme-dark" : "theme-light");
}
