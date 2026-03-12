import { useState } from "react";
import { C } from "../constants";

const EMPTY = { title: "", description: "", teamId: 1, priority: "중간", assignee: "", dueDate: "", tags: "", progress: 0 };

export default function AddTaskModal({ teams, onAdd, onClose }) {
  const [nt, setNt] = useState({ ...EMPTY, teamId: teams[0]?.id || 1 });

  const handleAdd = () => {
    if (!nt.title) return;
    onAdd({
      ...nt,
      teamId: Number(nt.teamId),
      status: "대기",
      createdAt: new Date().toISOString().split("T")[0],
      tags: nt.tags.split(",").map(s => s.trim()).filter(Boolean),
      progress: Number(nt.progress),
      id: Date.now(),
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={C.overlay}>
      <div onClick={e => e.stopPropagation()} style={C.mbox(490)}>
        <div style={C.mhead}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>새 업무 추가</h3>
          <button onClick={onClose} style={C.xbtn}>✕</button>
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["업무명 *", "text", "title", "업무 제목"],
            ["담당자", "text", "assignee", "담당자 이름"],
            ["마감일", "date", "dueDate", ""],
            ["태그 (쉼표로 구분)", "text", "tags", "예: React, API"],
          ].map(([label, type, field, ph]) => (
            <div key={field}>
              <label style={C.lbl}>{label}</label>
              <input type={type} value={nt[field]} onChange={e => setNt(p => ({ ...p, [field]: e.target.value }))} placeholder={ph} style={C.inp} />
            </div>
          ))}
          <div>
            <label style={C.lbl}>설명</label>
            <textarea value={nt.description} onChange={e => setNt(p => ({ ...p, description: e.target.value }))} placeholder="업무 상세 설명" rows={3} style={{ ...C.inp, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={C.lbl}>팀</label>
              <select value={nt.teamId} onChange={e => setNt(p => ({ ...p, teamId: e.target.value }))} style={C.inp}>
                {teams.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={C.lbl}>우선순위</label>
              <select value={nt.priority} onChange={e => setNt(p => ({ ...p, priority: e.target.value }))} style={C.inp}>
                {["높음", "중간", "낮음"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleAdd} style={C.sbtn(!!nt.title)}>업무 추가하기</button>
        </div>
      </div>
    </div>
  );
}
