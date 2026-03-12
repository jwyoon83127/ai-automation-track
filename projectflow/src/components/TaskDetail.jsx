import { useState } from "react";
import { C, statusConfig, priorityConfig, ROLES, PERMISSIONS } from "../constants";

const STATUS_COLOR = { "완료": "#0891b2", "진행중": "#2563eb", "대기": "#94a3b8" };

/* ── Delete confirmation modal ──────────────────── */
function DeleteConfirm({ taskTitle, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ ...C.overlay, zIndex: 310 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: "28px 28px 22px",
        width: "100%", maxWidth: 380,
        boxShadow: "0 20px 60px rgba(15,23,42,0.2)",
        border: "1px solid #e2e8f0",
      }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", textAlign: "center", marginBottom: 6 }}>업무를 삭제할까요?</div>
        <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 22, lineHeight: 1.6 }}>
          <strong style={{ color: "#1e293b" }}>"{taskTitle}"</strong><br />
          삭제하면 복구할 수 없습니다.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "10px 0", border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", color: "#64748b", fontSize: 13, cursor: "pointer" }}
          >취소</button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#1e3a8a,#1e3a8a)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >삭제 확인</button>
        </div>
      </div>
    </div>
  );
}

export default function TaskDetail({ task, teams, currentUser, onClose, onUpdateStatus, onUpdateProgress, onDelete, onUpdateSubtask }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const team  = teams.find(t => t.id === task.teamId);
  const role  = ROLES[currentUser.role];
  const perms = PERMISSIONS[currentUser.role];

  const subtasks = task.subtasks || [];
  const doneSubs = subtasks.filter(s => s.status === "완료").length;

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(task.id);
  };

  return (
    <>
      <div onClick={onClose} style={C.overlay}>
        <div onClick={e => e.stopPropagation()} style={{ ...C.mbox(500), display: "flex", flexDirection: "column" }}>

          {/* ── Header ──────────────────────────────── */}
          <div style={C.mhead}>
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${team?.color}12`, color: team?.color }}>{team?.emoji} {team?.name}</span>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: statusConfig[task.status]?.bg, color: statusConfig[task.status]?.color }}>{task.status}</span>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f1f5f9", color: "#64748b" }}>{priorityConfig[task.priority]?.label} {task.priority}</span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{task.title}</h2>
            </div>
            <button onClick={onClose} style={C.xbtn}>✕</button>
          </div>

          {/* ── Body ────────────────────────────────── */}
          <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>

            {/* Description */}
            <div style={{ background: "#fafbfc", borderRadius: 10, padding: 13, fontSize: 13, color: "#475569", lineHeight: 1.7, border: "1px solid #f1f5f9" }}>
              {task.description || "설명 없음"}
            </div>

            {/* Meta grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["담당자", `👤 ${task.assignee}`],
                ["마감일", `📅 ${task.dueDate}`],
                ["생성일", `📌 ${task.createdAt}`],
                ["태그",   task.tags?.length ? task.tags.map(t => `#${t}`).join("  ") : "-"],
              ].map(([l, v]) => (
                <div key={l} style={{ background: "#fafbfc", borderRadius: 10, padding: "10px 13px", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 12, color: "#1e293b", fontWeight: 500, wordBreak: "break-all" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ background: "#fafbfc", borderRadius: 10, padding: "12px 15px", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>진행률</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{task.progress}%</span>
              </div>
              <div style={{ height: 7, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: perms.editTask ? 9 : 0 }}>
                <div style={{ height: "100%", width: `${task.progress}%`, background: task.progress === 100 ? "#0891b2" : "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: 4, transition: "width 0.3s" }} />
              </div>
              {perms.editTask
                ? <input type="range" min="0" max="100" value={task.progress} onChange={e => onUpdateProgress(task.id, e.target.value)} style={{ width: "100%", accentColor: "#2563eb" }} />
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

            {/* ── Subtasks ──────────────────────────── */}
            {subtasks.length > 0 && (
              <div style={{ background: "#fafbfc", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>🔀 하위과제</span>
                  <span style={{ fontSize: 11, color: doneSubs === subtasks.length ? "#0891b2" : "#94a3b8", fontWeight: 600 }}>
                    {doneSubs}/{subtasks.length} 완료
                  </span>
                </div>
                {/* Progress bar for subtasks */}
                <div style={{ height: 3, background: "#e2e8f0" }}>
                  <div style={{ height: "100%", width: `${subtasks.length ? (doneSubs / subtasks.length) * 100 : 0}%`, background: team?.color || "#2563eb", transition: "width 0.3s" }} />
                </div>
                {subtasks.map(sub => {
                  const sc = STATUS_COLOR[sub.status] || "#94a3b8";
                  return (
                    <div key={sub.id} style={{ padding: "9px 14px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Checkbox-style toggle */}
                      <button
                        onClick={() => perms.editTask && onUpdateSubtask && onUpdateSubtask(task.id, sub.id, sub.status === "완료" ? "대기" : "완료")}
                        title={perms.editTask ? (sub.status === "완료" ? "완료 취소" : "완료로 변경") : "수정 권한 없음"}
                        style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                          border: sub.status === "완료" ? "none" : `2px solid #d1d5db`,
                          background: sub.status === "완료" ? "#0891b2" : "transparent",
                          cursor: perms.editTask && onUpdateSubtask ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, color: "#fff",
                        }}
                      >{sub.status === "완료" ? "✓" : ""}</button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: sub.status === "완료" ? "#94a3b8" : "#334155", textDecoration: sub.status === "완료" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sub.title}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                          {sub.assignee} · {sub.startDate} ~ {sub.dueDate}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {sub.status === "진행중" && (
                          <div style={{ width: 50, height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${sub.progress}%`, height: "100%", background: team?.color || "#2563eb" }} />
                          </div>
                        )}
                        <span style={{ fontSize: 10, color: sc, fontWeight: 600, minWidth: 28, textAlign: "right" }}>{sub.progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tags */}
            {task.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {task.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.15)" }}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Delete */}
            {perms.deleteTask
              ? <button
                  onClick={() => setShowDeleteConfirm(true)}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(30,58,138,0.06)"; e.currentTarget.style.color = "#1e3a8a"; e.currentTarget.style.borderColor = "rgba(30,58,138,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fafbfc"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  style={{ background: "#fafbfc", border: "1px solid #e2e8f0", borderRadius: 9, padding: "9px 0", color: "#94a3b8", fontSize: 12, cursor: "pointer", transition: "all 0.2s", width: "100%" }}
                >🗑️ 업무 삭제</button>
              : <div style={{ background: "#fafbfc", border: "1px solid #f1f5f9", borderRadius: 9, padding: "9px 0", color: "#e2e8f0", fontSize: 12, textAlign: "center" }}>🔒 삭제 권한 없음</div>}
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <DeleteConfirm
          taskTitle={task.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
