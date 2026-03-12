import { useState } from "react";
import { PERMISSIONS, statusConfig } from "../constants";

export default function Sidebar({ data, setData, currentUser, selTeam, setSelTeam, stFilter, setStFilter, onAddTeam }) {
  const perms = PERMISSIONS[currentUser.role];
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState("");

  const allTeams = [{ id: "전체", name: "전체", color: "#2563eb", emoji: "📊" }, ...data.teams];

  const getStats = (tid) => {
    const ts = tid === "전체" ? data.tasks : data.tasks.filter(t => t.teamId === tid);
    return { total: ts.length, done: ts.filter(t => t.status === "완료").length };
  };

  const startRenameTeam = (team, e) => {
    e.stopPropagation();
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  };

  const doRenameTeam = (teamId) => {
    if (!editingTeamName.trim()) { setEditingTeamId(null); return; }
    setData(d => ({ ...d, teams: d.teams.map(t => t.id === teamId ? { ...t, name: editingTeamName.trim() } : t) }));
    setEditingTeamId(null);
  };

  return (
    <div style={{ width: 200, borderRight: "1px solid #e2e8f0", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto", flexShrink: 0, background: "#ffffff" }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#94a3b8", padding: "4px 8px 7px", textTransform: "uppercase" }}>팀 목록</div>

      {allTeams.map(team => {
        const ts = getStats(team.id);
        const isA = selTeam === team.id;
        const isEditing = editingTeamId === team.id;

        if (team.id === "전체") return (
          <button key={team.id} onClick={() => setSelTeam(team.id)} style={{ background: isA ? "rgba(37,99,235,0.06)" : "transparent", border: isA ? "1px solid rgba(37,99,235,0.18)" : "1px solid transparent", borderRadius: 9, padding: "8px 10px", textAlign: "left", color: isA ? "#2563eb" : "#475569", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", width: "100%" }}>
            <span style={{ fontSize: 14 }}>{team.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: isA ? 600 : 400 }}>{team.name}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{ts.total}개</div>
            </div>
            {isA && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2563eb" }} />}
          </button>
        );

        return (
          <div key={team.id} style={{ position: "relative" }}>
            <button
              onClick={() => setSelTeam(team.id)}
              style={{ background: isA ? "rgba(37,99,235,0.06)" : "transparent", border: isA ? "1px solid rgba(37,99,235,0.18)" : "1px solid transparent", borderRadius: 9, padding: "8px 10px", textAlign: "left", color: isA ? "#2563eb" : "#475569", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", width: "100%" }}
              className="team-btn"
            >
              <span style={{ fontSize: 14 }}>{team.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                  <input
                    autoFocus
                    value={editingTeamName}
                    onChange={e => setEditingTeamName(e.target.value)}
                    onBlur={() => doRenameTeam(team.id)}
                    onKeyDown={e => { if (e.key === "Enter") doRenameTeam(team.id); if (e.key === "Escape") setEditingTeamId(null); }}
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", background: "#ffffff", border: "1px solid #c7d2fe", borderRadius: 5, padding: "1px 5px", outline: "none", width: "100%" }}
                  />
                ) : (
                  <div style={{ fontSize: 12, fontWeight: isA ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</div>
                )}
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{ts.total}개</div>
              </div>
              {isA && !isEditing && <div style={{ width: 5, height: 5, borderRadius: "50%", background: team.color || "#2563eb" }} />}
              {perms.addTeam && !isEditing && (
                <span
                  onClick={e => startRenameTeam(team, e)}
                  title="팀 이름 수정"
                  className="team-edit-icon"
                  style={{ fontSize: 11, color: "#94a3b8", padding: "1px 3px", borderRadius: 4, lineHeight: 1, flexShrink: 0 }}
                >✏️</span>
              )}
            </button>
          </div>
        );
      })}

      {perms.addTeam
        ? <button onClick={onAddTeam} style={{ background: "transparent", border: "1px dashed #e2e8f0", borderRadius: 9, padding: "7px 10px", color: "#94a3b8", fontSize: 11, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", marginTop: 4 }}>+ 팀 추가</button>
        : <div style={{ border: "1px dashed #f1f5f9", borderRadius: 9, padding: "7px 10px", color: "#e2e8f0", fontSize: 11, marginTop: 4 }}>+ 팀 추가 (권한 없음)</div>}

      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#94a3b8", padding: "14px 8px 7px", textTransform: "uppercase" }}>상태 필터</div>
      {["전체", "대기", "진행중", "완료"].map(st => (
        <button key={st} onClick={() => setStFilter(st)} style={{ background: stFilter === st ? statusConfig[st].bg : "transparent", border: stFilter === st ? `1px solid ${statusConfig[st].color}40` : "1px solid transparent", borderRadius: 8, padding: "7px 10px", textAlign: "left", color: stFilter === st ? statusConfig[st].color : "#64748b", fontSize: 12, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusConfig[st].color, display: "inline-block" }} />{st}
        </button>
      ))}

      <div style={{ marginTop: "auto", padding: "10px 8px", background: "#fafbfc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 7, textTransform: "uppercase", letterSpacing: 1 }}>내 권한 요약</div>
        {Object.entries({ "업무 추가": perms.addTask, "업무 수정": perms.editTask, "업무 삭제": perms.deleteTask, "사용자 관리": perms.manageUsers }).map(([label, ok]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: "#64748b" }}>{label}</span>
            <span style={{ fontSize: 10, color: ok ? "#0891b2" : "#cbd5e1" }}>{ok ? "✓" : "✗"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
