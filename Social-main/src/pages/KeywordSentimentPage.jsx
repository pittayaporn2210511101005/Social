import React, { useEffect, useState } from "react";

// ตัวเลือกประเภทความรู้สึก
const SENTIMENT_OPTIONS = [
  { value: "GOOD", label: "ดี" },
  { value: "NEUTRAL", label: "กลาง" },
  { value: "BAD", label: "แย่" },
];

function KeywordSentimentPage() {
  const [items, setItems] = useState([]); // รายการคำทั้งหมด
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ฟอร์มเพิ่มคำใหม่
  const [newItem, setNewItem] = useState({
    phrase: "",
    sentiment: "NEUTRAL",
    weight: 0,
  });

  // สำหรับโหมดแก้ไข
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState({
    phrase: "",
    sentiment: "NEUTRAL",
    weight: 0,
  });

  // โหลดข้อมูลจาก backend ตอนเปิดหน้า
  useEffect(() => {
    fetchKeywords();
  }, []);

  // 🔹 ดึงข้อมูลจาก backend
  const fetchKeywords = async () => {
    try {
      setLoading(true);
      setError("");

      // 👇 เปลี่ยน URL ให้ตรงกับ backend ของคุณ
      const res = await fetch("/api/sentiment-dictionary");
      if (!res.ok) {
        throw new Error("โหลดข้อมูลไม่สำเร็จ");
      }
      const data = await res.json();
      setItems(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 จัดการเปลี่ยนค่าฟอร์มเพิ่มคำใหม่
  const handleNewChange = (field, value) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: field === "weight" ? Number(value) : value,
    }));
  };

  // 🔹 เพิ่มคำใหม่
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.phrase.trim()) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/sentiment-dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!res.ok) {
        throw new Error("เพิ่มคำไม่สำเร็จ");
      }

      const saved = await res.json();
      // ถ้า backend return object เดียว
      setItems((prev) => [...prev, saved]);

      // ล้างฟอร์ม
      setNewItem({
        phrase: "",
        sentiment: "NEUTRAL",
        weight: 0,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 เข้าโหมดแก้ไขแถว
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingDraft({
      phrase: item.phrase,
      sentiment: item.sentiment,
      weight: item.weight ?? 0,
    });
  };

  // 🔹 จัดการเปลี่ยนค่าฟอร์มตอนแก้ไข
  const handleEditChange = (field, value) => {
    setEditingDraft((prev) => ({
      ...prev,
      [field]: field === "weight" ? Number(value) : value,
    }));
  };

  // 🔹 ยกเลิกการแก้ไข
  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft({
      phrase: "",
      sentiment: "NEUTRAL",
      weight: 0,
    });
  };

  // 🔹 บันทึกคำที่แก้ไข
  const saveEdit = async (id) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/sentiment-dictionary/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDraft),
      });

      if (!res.ok) {
        throw new Error("บันทึกการแก้ไขไม่สำเร็จ");
      }

      const updated = await res.json();

      setItems((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );

      cancelEdit();
    } catch (err) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 ลบคำ
  const deleteItem = async (id) => {
    if (!window.confirm("ยืนยันการลบคำนี้หรือไม่?")) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/sentiment-dictionary/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("ลบคำไม่สำเร็จ");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const renderSentimentLabel = (value) => {
    const found = SENTIMENT_OPTIONS.find((o) => o.value === value);
    return found ? found.label : value;
  };

  return (
    <div className="keyword-page">
      <h1 className="page-title">พจนานุกรมคำพูด (Keyword Sentiment)</h1>

      {/* แจ้ง error */}
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="alert alert-info">กำลังโหลด / บันทึกข้อมูล...</div>}

      {/* ฟอร์มเพิ่มคำใหม่ */}
      <form className="card new-form" onSubmit={handleAdd}>
        <h2>เพิ่มคำ / วลีใหม่</h2>
        <div className="form-row">
          <label>คำ / วลี</label>
          <input
            type="text"
            value={newItem.phrase}
            onChange={(e) => handleNewChange("phrase", e.target.value)}
            placeholder="เช่น เหี้ย, บริการดีมาก, ธรรมดา"
            required
          />
        </div>

        <div className="form-row">
          <label>ประเภทความรู้สึก</label>
          <select
            value={newItem.sentiment}
            onChange={(e) => handleNewChange("sentiment", e.target.value)}
          >
            {SENTIMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>น้ำหนัก (optional)</label>
          <input
            type="number"
            step="0.1"
            min="-1"
            max="1"
            value={newItem.weight}
            onChange={(e) => handleNewChange("weight", e.target.value)}
          />
          <small>ค่าประมาณ -1 ถึง 1 เช่น 0.9 คือแย่มาก / ดีมาก</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          เพิ่มคำ
        </button>
      </form>

      {/* ตารางคำทั้งหมด */}
      <div className="card table-wrapper">
        <h2>รายการคำที่กำหนดไว้</h2>
        {items.length === 0 ? (
          <p>ยังไม่มีคำที่กำหนดไว้</p>
        ) : (
          <table className="keyword-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>คำ / วลี</th>
                <th style={{ width: "20%" }}>ประเภทความรู้สึก</th>
                <th style={{ width: "15%" }}>น้ำหนัก</th>
                <th style={{ width: "25%" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingDraft.phrase}
                          onChange={(e) =>
                            handleEditChange("phrase", e.target.value)
                          }
                        />
                      ) : (
                        item.phrase
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editingDraft.sentiment}
                          onChange={(e) =>
                            handleEditChange("sentiment", e.target.value)
                          }
                        >
                          {SENTIMENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        renderSentimentLabel(item.sentiment)
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          min="-1"
                          max="1"
                          value={editingDraft.weight}
                          onChange={(e) =>
                            handleEditChange("weight", e.target.value)
                          }
                        />
                      ) : (
                        (item.weight ?? 0).toFixed(1)
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => saveEdit(item.id)}
                            disabled={loading}
                          >
                            บันทึก
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={cancelEdit}
                            disabled={loading}
                          >
                            ยกเลิก
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => startEdit(item)}
                            disabled={loading}
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteItem(item.id)}
                            disabled={loading}
                          >
                            ลบ
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default KeywordSentimentPage;