import { useState } from "react";
import { statusConfig } from "../constants";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const BAR_H  = 22; // px per slot
const BAR_GAP = 2;

export default function CalendarView({ tasks, teams, onSelectTask }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const getTeam = (id) => teams.find(t => t.id === id);

  const pad = (n) => String(n).padStart(2, "0");
  const toStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const todayStr = toStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Build cell array
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let w = 0; w < cells.length / 7; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  // Convert week cell array to date-string array (null for empty cells)
  const weekToDateStrs = (week) =>
    week.map(d => (d ? toStr(year, month, d) : null));

  // Compute spanning tasks for a week
  const getWeekBars = (week) => {
    const dateStrs  = weekToDateStrs(week);
    const validDates = dateStrs.filter(Boolean);
    if (!validDates.length) return [];

    const weekStart = validDates[0];
    const weekEnd   = validDates[validDates.length - 1];

    const bars = [];
    tasks.forEach(task => {
      const start = task.createdAt;
      const end   = task.dueDate;
      if (start > weekEnd || end < weekStart) return;

      // startCol: first column where the bar begins
      let startCol = dateStrs.findIndex(d => d !== null && d >= start);
      if (startCol === -1) startCol = dateStrs.findIndex(d => d !== null);

      // endCol: last column where the bar ends
      let endCol = -1;
      for (let i = 6; i >= 0; i--) {
        if (dateStrs[i] !== null && dateStrs[i] <= end) { endCol = i; break; }
      }
      if (endCol === -1 || endCol < startCol) return;

      bars.push({
        task,
        startCol,
        endCol,
        startsHere: start >= weekStart && start <= weekEnd,
        endsHere:   end   >= weekStart && end   <= weekEnd,
      });
    });

    // Sort by start col, then by task id for stability
    bars.sort((a, b) => a.startCol - b.startCol || a.task.id - b.task.id);

    // Assign vertical slots (greedy)
    const slotEnd = []; // slotEnd[s] = last endCol used in slot s
    bars.forEach(bar => {
      let slot = slotEnd.findIndex(e => e < bar.startCol);
      if (slot === -1) { slot = slotEnd.length; slotEnd.push(-1); }
      slotEnd[slot] = bar.endCol;
      bar.slot = slot;
    });

    return bars;
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#475569" }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", minWidth: 110, textAlign: "center" }}>{year}년 {month + 1}월</span>
        <button onClick={nextMonth} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#475569" }}>›</button>
        <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 8, padding: "5px 12px", color: "#4f46e5", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>오늘</button>

        {/* Legend */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          {[["대기","#64748b"],["진행중","#4f46e5"],["완료","#059669"]].map(([label, color]) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />{label}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        {/* Day labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid #f1f5f9" }}>
          {DAY_LABELS.map((d, i) => (
            <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: i === 0 ? "#ef4444" : i === 6 ? "#3b82f6" : "#94a3b8", letterSpacing: 1 }}>{d}</div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => {
          const bars      = getWeekBars(week);
          const maxSlot   = bars.length ? Math.max(...bars.map(b => b.slot)) + 1 : 0;
          const barAreaH  = maxSlot * BAR_H + (maxSlot > 0 ? BAR_GAP * 2 : 0);

          return (
            <div key={wi} style={{ borderBottom: wi < weeks.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              {/* Date number row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                {week.map((day, di) => {
                  const isToday = day && toStr(year, month, day) === todayStr;
                  return (
                    <div key={di} style={{ padding: "6px 8px", borderRight: di < 6 ? "1px solid #f1f5f9" : "none", background: isToday ? "rgba(79,70,229,0.03)" : "transparent" }}>
                      {day && (
                        <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isToday ? "#4f46e5" : "transparent", color: isToday ? "#ffffff" : di === 0 ? "#ef4444" : di === 6 ? "#3b82f6" : "#475569", fontSize: 12, fontWeight: isToday ? 700 : 400 }}>
                          {day}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Spanning bar area */}
              <div style={{ position: "relative", height: barAreaH + 4, minHeight: maxSlot > 0 ? barAreaH + 4 : 10 }}>
                {bars.map(({ task, startCol, endCol, startsHere, endsHere, slot }) => {
                  const team = getTeam(task.teamId);
                  const sc   = statusConfig[task.status];
                  const leftPct  = `calc(${startCol / 7 * 100}% + ${startsHere ? 4 : 0}px)`;
                  const rightPad = endsHere ? 4 : 0;
                  const widthPct = `calc(${(endCol - startCol + 1) / 7 * 100}% - ${(startsHere ? 4 : 0) + rightPad}px)`;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      title={`${task.title}\n${task.createdAt} ~ ${task.dueDate}\n담당: ${task.assignee}`}
                      style={{
                        position:    "absolute",
                        left:        leftPct,
                        width:       widthPct,
                        top:         BAR_GAP + slot * BAR_H,
                        height:      BAR_H - BAR_GAP,
                        background:  sc?.bg,
                        borderLeft:  startsHere ? `3px solid ${sc?.color}` : `0px solid transparent`,
                        borderRight: endsHere   ? `1px solid ${sc?.color}40` : "none",
                        borderTop:   `1px solid ${sc?.color}30`,
                        borderBottom:`1px solid ${sc?.color}30`,
                        borderTopLeftRadius:     startsHere ? 5 : 0,
                        borderBottomLeftRadius:  startsHere ? 5 : 0,
                        borderTopRightRadius:    endsHere   ? 5 : 0,
                        borderBottomRightRadius: endsHere   ? 5 : 0,
                        display:    "flex",
                        alignItems: "center",
                        paddingLeft: 5,
                        overflow:   "hidden",
                        cursor:     "pointer",
                        fontSize:   10,
                        color:      sc?.color,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        zIndex:     1,
                      }}
                    >
                      <span style={{ marginRight: 3, flexShrink: 0 }}>{team?.emoji}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
