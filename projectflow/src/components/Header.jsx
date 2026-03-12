import Avatar from "./Avatar";
import { ROLES, PERMISSIONS, C } from "../constants";

export default function Header({ currentUser, search, setSearch, onSettings, onAddTask, view, setView }) {
  const role = ROLES[currentUser.role];
  const perms = PERMISSIONS[currentUser.role];

  return (
    <div style={{
      background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #e2e8f0",
      padding: "0 20px", display: "flex", alignItems: "center", gap: 10,
      height: 56, position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(12px)", boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
    }}>
      <div style={{
        width: 32, height: 32, background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
        borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
      }}>⚡</div>
      <span style={{
        fontSize: 17, fontWeight: 700, letterSpacing: "-0.5px",
        background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>ProjectFlow</span>

      {/* View toggle */}
      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 9, padding: 3, gap: 2 }}>
        {[["list", "☰", "목록"], ["calendar", "📅", "캘린더"]].map(([v, icon, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{ background: view === v ? "#ffffff" : "transparent", border: "none", borderRadius: 7, padding: "5px 10px", color: view === v ? "#4f46e5" : "#94a3b8", fontSize: 11, fontWeight: view === v ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, boxShadow: view === v ? "0 1px 3px rgba(15,23,42,0.08)" : "none", transition: "all 0.15s" }}
          >{icon} {label}</button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, opacity: 0.35 }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="업무 검색..."
          style={{ ...C.inp, width: 160, padding: "6px 10px 6px 24px", fontSize: 12 }}
        />
      </div>

      <button
        onClick={onSettings}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(79,70,229,0.06)"; e.currentTarget.style.borderColor = "rgba(79,70,229,0.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
        style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", color: "#64748b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}
      >⚙️ 설정</button>

      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.15)", borderRadius: 10 }}>
        <Avatar name={currentUser.name} size={22} color={role.color} />
        <span style={{ fontSize: 11, color: "#4f46e5", fontWeight: 600 }}>{currentUser.name}</span>
        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: role.bg, color: role.color }}>{role.label}</span>
      </div>

      {perms.addTask
        ? <button onClick={onAddTask} style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", borderRadius: 8, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ 새 업무</button>
        : <div title={`${role.label}은 업무를 추가할 수 없습니다`} style={{ padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#cbd5e1", userSelect: "none" }}>+ 새 업무</div>}
    </div>
  );
}
