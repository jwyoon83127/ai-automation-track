import { C, statusConfig, priorityConfig, ROLES, PERMISSIONS } from "../constants";

export default function TaskDetail({ task, teams, currentUser, onClose, onUpdateStatus, onUpdateProgress, onDelete }) {
  const team = teams.find(t => t.id === task.teamId);
  const role = ROLES[currentUser.role];
  const perms = PERMISSIONS[currentUser.role];

  return (
    <div onClick={onClose} style={C.overlay}>
      <div onClick={e => e.stopPropagation()} style={C.mbox()}>
        <div style={C.mhead}>
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${team?.color}12`, color: team?.color }}>{team?.emoji} {team?.name}</span>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: statusConfig[task.status]?.bg, color: statusConfig[task.status]?.color }}>{task.status}</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{task.title}</h2>
          </div>
          <button onClick={onClose} style={C.xbtn}>✕</button>
        </div>

        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 13 }}>
          <div style={{ background: "#fafbfc", borderRadius: 10, padding: 13, fontSize: 13, color: "#475569", lineHeight: 1.7, border: "1px solid #f1f5f9" }}>
            {task.description || "설명 없음"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {[
              ["담당자", `👤 ${task.assignee}`],
              ["마감일", `📅 ${task.dueDate}`],
              ["우선순위", `${priorityConfig[task.priority]?.label} ${task.priority}`],
              ["생성일", `📌 ${task.createdAt}`],
            ].map(([l, v]) => (
              <div key={l} style={{ background: "#fafbfc", borderRadius: 10, padding: "10px 13px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 12, color: "#1e293b", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{ background: "#fafbfc", borderRadius: 10, padding: "12px 15px", border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>진행률</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>{task.progress}%</span>
            </div>
            <div style={{ height: 7, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: perms.editTask ? 9 : 0 }}>
              <div style={{ height: "100%", width: `${task.progress}%`, background: task.progress === 100 ? "#059669" : "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
            {perms.editTask
              ? <input type="range" min="0" max="100" value={task.progress} onChange={e => onUpdateProgress(task.id, e.target.value)} style={{ width: "100%", accentColor: "#4f46e5" }} />
              : <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>🔒 {role.label}은 수정 권한이 없습니다</div>}
          </div>

          {/* Status change */}
          {perms.editTask && (
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 7 }}>상태 변경</div>
              <div style={{ display: "flex", gap: 7 }}>
                {["대기", "진행중", "완료"].map(st => (
                  <button key={st} onClick={() => onUpdateStatus(task.id, st)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: task.status === st ? `1px solid ${statusConfig[st]?.color}` : "1px solid #e2e8f0", background: task.status === st ? statusConfig[st]?.bg : "transparent", color: task.status === st ? statusConfig[st]?.color : "#64748b", fontSize: 12, fontWeight: task.status === st ? 600 : 400, cursor: "pointer" }}>{st}</button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {task.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(79,70,229,0.08)", color: "#4f46e5", border: "1px solid rgba(79,70,229,0.15)" }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Delete */}
          {perms.deleteTask
            ? <button
                onClick={() => onDelete(task.id)}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.06)"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fafbfc"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                style={{ background: "#fafbfc", border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 0", color: "#94a3b8", fontSize: 12, cursor: "pointer", transition: "all 0.2s", width: "100%" }}
              >🗑️ 업무 삭제</button>
            : <div style={{ background: "#fafbfc", border: "1px solid #f1f5f9", borderRadius: 9, padding: "9px 0", color: "#e2e8f0", fontSize: 12, textAlign: "center" }}>🔒 삭제 권한 없음</div>}
        </div>
      </div>
    </div>
  );
}
