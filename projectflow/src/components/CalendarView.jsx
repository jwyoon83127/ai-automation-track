import { useState } from "react";
import { statusConfig, priorityConfig } from "../constants";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarView({ tasks, teams, onSelectTask }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const getTeam = (id) => teams.find(t => t.id === id);

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;

  const tasksByDate = {};
  tasks.forEach(t => {
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
    tasksByDate[t.dueDate].push(t);
  });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#475569" }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", minWidth: 120, textAlign: "center" }}>
          {year}년 {month + 1}월
        </span>
        <button onClick={nextMonth} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#475569" }}>›</button>
        <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 8, padding: "5px 12px", color: "#4f46e5", fontSize: 12, fontWeight: 600, cursor: "pointer", marginLeft: 4 }}>오늘</button>

        {/* Legend */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          {[["대기", "#64748b"], ["진행중", "#4f46e5"], ["완료", "#059669"]].map(([label, color]) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />{label}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        {/* Day labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #f1f5f9" }}>
          {DAY_LABELS.map((d, i) => (
            <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: i === 0 ? "#ef4444" : i === 6 ? "#3b82f6" : "#94a3b8", letterSpacing: 1 }}>{d}</div>
          ))}
        </div>

        {/* Weeks */}
        {Array.from({ length: cells.length / 7 }, (_, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: wi < cells.length / 7 - 1 ? "1px solid #f1f5f9" : "none" }}>
            {cells.slice(wi * 7, wi * 7 + 7).map((day, di) => {
              const isToday = day && dateStr(day) === todayStr;
              const dayTasks = day ? (tasksByDate[dateStr(day)] || []) : [];
              const colIdx = di; // 0=Sun, 6=Sat
              return (
                <div key={di} style={{ minHeight: 100, padding: "6px 7px", borderRight: di < 6 ? "1px solid #f1f5f9" : "none", background: isToday ? "rgba(79,70,229,0.03)" : "transparent", verticalAlign: "top" }}>
                  {day && (
                    <>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, background: isToday ? "#4f46e5" : "transparent", color: isToday ? "#ffffff" : colIdx === 0 ? "#ef4444" : colIdx === 6 ? "#3b82f6" : "#475569", fontSize: 12, fontWeight: isToday ? 700 : 400 }}>
                        {day}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {dayTasks.slice(0, 3).map(task => {
                          const team = getTeam(task.teamId);
                          const sc = statusConfig[task.status];
                          return (
                            <div
                              key={task.id}
                              onClick={() => onSelectTask(task)}
                              title={`${task.title} (${task.assignee})`}
                              style={{ background: sc?.bg, borderLeft: `2px solid ${sc?.color}`, borderRadius: "0 4px 4px 0", padding: "2px 5px", fontSize: 10, color: sc?.color, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.5 }}
                            >
                              {team?.emoji} {task.title}
                            </div>
                          );
                        })}
                        {dayTasks.length > 3 && (
                          <div style={{ fontSize: 10, color: "#94a3b8", paddingLeft: 4 }}>+{dayTasks.length - 3}개 더</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
