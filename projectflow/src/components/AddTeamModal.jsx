import { useState } from "react";
import { C } from "../constants";

export default function AddTeamModal({ onAdd, onClose }) {
  const [nTeam, setNTeam] = useState({ name: "", emoji: "🚀", color: "#2563eb" });

  const handleAdd = () => {
    if (!nTeam.name) return;
    onAdd({ ...nTeam, id: Date.now() });
    onClose();
  };

  return (
    <div onClick={onClose} style={C.overlay}>
      <div onClick={e => e.stopPropagation()} style={C.mbox(370)}>
        <div style={C.mhead}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>팀 추가</h3>
          <button onClick={onClose} style={C.xbtn}>✕</button>
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={C.lbl}>팀 이름 *</label>
            <input value={nTeam.name} onChange={e => setNTeam(p => ({ ...p, name: e.target.value }))} placeholder="팀 이름" style={C.inp} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={C.lbl}>이모지</label>
              <input value={nTeam.emoji} onChange={e => setNTeam(p => ({ ...p, emoji: e.target.value }))} style={{ ...C.inp, textAlign: "center", fontSize: 22 }} />
            </div>
            <div>
              <label style={C.lbl}>팀 색상</label>
              <input type="color" value={nTeam.color} onChange={e => setNTeam(p => ({ ...p, color: e.target.value }))} style={{ ...C.inp, padding: 5, height: 42 }} />
            </div>
          </div>
          <button onClick={handleAdd} style={C.sbtn(!!nTeam.name)}>팀 생성하기</button>
        </div>
      </div>
    </div>
  );
}
