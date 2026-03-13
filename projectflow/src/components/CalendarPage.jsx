import { useState, useMemo } from "react";
import { statusConfig } from "../constants";

const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DAY_NAMES   = ["일","월","화","수","목","금","토"];

export default function CalendarPage({ tasks, teams, onSelectTask }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const getTeam = (id) => teams.find(t => t.id === id);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  // Build 42-cell calendar grid
  const firstDay      = new Date(year, month, 1).getDay();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const daysInPrev    = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), cur: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), cur: true });
  while (cells.length < 42)
    cells.push({ date: new Date(year, month + 1, cells.length - firstDay - daysInMonth + 1), cur: false });

  const dateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const todayStr = dateStr(today);
  const isToday = (d) => dateStr(d) === todayStr;

  // Pre-index tasks by dueDate for O(1) lookup per cell (replaces O(n) filter × 42 cells)
  const { tasksByDate, stats } = useMemo(() => {
    const map = {};
    const monthTasks = [];
    for (const t of tasks) {
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
      const [y, m] = t.dueDate.split("-").map(Number);
      if (y === year && m === month + 1) monthTasks.push(t);
    }
    return {
      tasksByDate: map,
      stats: {
        total:      monthTasks.length,
        done:       monthTasks.filter(t => t.status === "완료").length,
        inProgress: monthTasks.filter(t => t.status === "진행중").length,
        waiting:    monthTasks.filter(t => t.status === "대기").length,
      },
    };
  }, [tasks, year, month]);

  const getTasksFor = (d) => tasksByDate[dateStr(d)] || [];

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>

      {/* Month stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "이번 달 전체", value: stats.total,      color: "#2563eb", icon: "📋" },
          { label: "진행중",       value: stats.inProgress,  color: "#1e3a8a", icon: "⚡" },
          { label: "대기중",       value: stats.waiting,     color: "#0ea5e9", icon: "⏳" },
          { label: "완료",         value: stats.done,        color: "#0891b2", icon: "✅" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={prevMonth}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#c7d2fe"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#475569", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
          >‹</button>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", minWidth: 110, textAlign: "center" }}>
            {year}년 {MONTH_NAMES[month]}
          </span>
          <button
            onClick={nextMonth}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#c7d2fe"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#475569", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
          >›</button>
        </div>
        <button
          onClick={goToday}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,99,235,0.06)"; }}
          style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "#2563eb", fontSize: 12, fontWeight: 600, transition: "background 0.2s" }}
        >오늘</button>
      </div>

      {/* Calendar grid */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>

        {/* Day-of-week headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: "#fafbfc", borderBottom: "1px solid #e2e8f0" }}>
          {DAY_NAMES.map((d, i) => (
            <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: i === 0 ? "#1e3a8a" : i === 6 ? "#2563eb" : "#64748b" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {cells.map((cell, idx) => {
            const dayTasks = getTasksFor(cell.date);
            const isSun    = cell.date.getDay() === 0;
            const isSat    = cell.date.getDay() === 6;
            const todayCell = isToday(cell.date);
            const isLast   = idx >= 35;

            return (
              <div
                key={idx}
                style={{
                  minHeight: 100,
                  padding: "6px 8px",
                  background: !cell.cur ? "#fafbfc" : "#fff",
                  borderRight:  (idx + 1) % 7 !== 0 ? "1px solid #f1f5f9" : "none",
                  borderBottom: !isLast ? "1px solid #f1f5f9" : "none",
                }}
              >
                {/* Date number */}
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: todayCell ? 700 : 400, marginBottom: 4,
                  background: todayCell ? "#2563eb" : "transparent",
                  color: todayCell ? "#fff"
                       : !cell.cur ? "#cbd5e1"
                       : isSun    ? "#1e3a8a"
                       : isSat    ? "#2563eb"
                       : "#1e293b",
                }}>
                  {cell.date.getDate()}
                </div>

                {/* Task badges */}
                {dayTasks.slice(0, 3).map(task => {
                  const team = getTeam(task.teamId);
                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      title={`${task.title} (${task.assignee})`}
                      style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 4, marginBottom: 2,
                        background: statusConfig[task.status]?.bg,
                        color: statusConfig[task.status]?.color,
                        borderLeft: `3px solid ${team?.color || "#2563eb"}`,
                        border: `1px solid ${statusConfig[task.status]?.color}25`,
                        borderLeftWidth: 3,
                        cursor: "pointer",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        transition: "opacity 0.15s",
                      }}
                    >
                      {task.title}
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: 9, color: "#94a3b8", padding: "1px 4px" }}>
                    +{dayTasks.length - 3}개 더
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        {[["대기", "#64748b"], ["진행중", "#2563eb"], ["완료", "#0891b2"]].map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: `${color}18`, border: `1px solid ${color}40`, borderLeft: `3px solid ${color}`, display: "inline-block" }} />
            {label}
          </div>
        ))}
        <div style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
          업무 배지를 클릭하면 상세 보기가 열립니다
        </div>
      </div>
    </div>
  );
}
