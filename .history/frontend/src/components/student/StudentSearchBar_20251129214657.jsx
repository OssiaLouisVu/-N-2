import React from "react";

export default function StudentSearchBar({ keyword, setKeyword, status, setStatus, onSearch }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: 'center' }}>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Nhập SĐT / tên / email học viên..."
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: 999,
          border: "1px solid #e0e0e0",
          outline: "none",
        }}
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0" }}
      >
        <option value="">Tất cả</option>
        <option value="NEW">NEW</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>

      <button
        type="button"
        onClick={onSearch}
        style={{
          padding: "10px 20px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #1677ff 0%, #40a9ff 100%)",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Tìm
      </button>
    </div>
  );
}
