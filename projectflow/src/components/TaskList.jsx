import { statusConfig, priorityConfig } from "../constants";

export default function TaskList({ tasks, teams, stats, onSelectTask }) {
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const getTeam = (id) => teams.find(t => t.id === id);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "전체 업무", value: stats.total,      color: "#4f46e5", icon: "📋" },
          { label: "진행중",   value: stats.inProgress,  color: "#7c3aed", icon: "⚡" },
          { label: "대기중",   value: stats.waiting,     color: "#d97706", icon: "⏳" },
          { label: "완료",     value: stats.done,        color: "#059669", icon: "✅" },
        ].map(s => (
          <div key={s.label} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 18px", marginBottom: 16, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>전체 완료율</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{stats.done} / {stats.total}건</span>
              <span style={{ fontSize: 13, color: "#4f46e5", fontWeight: 700 }}>{pct}%</span>
            </div>
          </div>
          <div style={{ height: 7, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#4f46e5,#059669)", borderRadius: 4, transition: "width 0.5s" }} />
          </div>
        </div>
      )}

      {/* Tasks */}
      {tasks.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}><div style={{ fontSize: 40, marginBottom: 10 }}>📭</div><div style={{ fontSize: 14 }}>업무가 없습니다</div></div>
        : tasks.map(task => {
          const team = getTeam(task.teamId);
          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(79,70,229,0.1)"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.04)"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "13px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 7, transition: "all 0.2s", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
            >
              <div style={{ width: 4, height: 44, borderRadius: 2, background: team?.color || "#4f46e5", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: statusConfig[task.status]?.bg, color: statusConfig[task.status]?.color, flexShrink: 0 }}>{task.status}</span>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8", flexWrap: "wrap" }}>
                  <span>{team?.emoji} {team?.name}</span>
                  <span>👤 {task.assignee}</span>
                  <span>📅 {task.dueDate}</span>
                  <span>{priorityConfig[task.priority]?.label} {task.priority}</span>
                </div>
              </div>
              <div style={{ flexShrink: 0, width: 70 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3, textAlign: "right" }}>{task.progress}%</div>
                <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${task.progress}%`, background: task.progress === 100 ? "#059669" : "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
