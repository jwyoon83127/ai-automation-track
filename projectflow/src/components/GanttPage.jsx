import { useState, useMemo } from "react";
import { STATUS_COLOR } from "../constants";

const BASE_DAY_W = 22; // pixels per day at zoom=1
const ROW_H      = 42;
const LEFT_W     = 290;
const MONTH_KO = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function diffDays(a, b) {
  return Math.round((b - a) / 86400000);
}
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function GanttPage({ tasks, teams, onSelectTask }) {
  const [expanded, setExpanded] = useState(() => new Set(tasks.map(t => t.id)));
  const [zoom, setZoom]         = useState(1);
  const dayW = BASE_DAY_W * zoom;

  const getTeam = id => teams.find(t => t.id === id);

  /* ── Timeline geometry — memoized, recomputes only when tasks/zoom change ── */
  const { minDate, totalDays, todayOff, months, weeks, dayLines, groups } = useMemo(() => {
    const allDates = tasks.flatMap(t => [
      parseDate(t.createdAt), parseDate(t.dueDate),
      ...(t.subtasks || []).flatMap(s => [parseDate(s.startDate), parseDate(s.dueDate)]),
    ]);
    const minRaw = new Date(Math.min(...allDates));
    const maxRaw = new Date(Math.max(...allDates));
    const minDate = new Date(minRaw); minDate.setDate(minDate.getDate() - 5);
    const maxDate = new Date(maxRaw); maxDate.setDate(maxDate.getDate() + 5);
    const totalDays = diffDays(minDate, maxDate) + 1;
    const todayOff  = diffDays(minDate, new Date());

    // Month headers
    const months = [];
    let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (cur <= maxDate) {
      const startOff = Math.max(diffDays(minDate, cur), 0);
      const nextMon  = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      const endOff   = Math.min(diffDays(minDate, nextMon), totalDays);
      if (endOff > startOff) {
        months.push({ label: `${cur.getFullYear()}년 ${MONTH_KO[cur.getMonth()]}`, startOff, endOff });
      }
      cur = nextMon;
    }

    // Week markers every 7 days
    const weeks = [];
    for (let i = 0; i < totalDays; i += 7) {
      const d = new Date(minDate); d.setDate(d.getDate() + i);
      weeks.push({ off: i, label: `${d.getMonth()+1}/${d.getDate()}` });
    }

    const dayLines = Array.from({ length: totalDays }, (_, i) => i);

    const groups = teams
      .map(team => ({ team, tasks: tasks.filter(t => t.teamId === team.id) }))
      .filter(g => g.tasks.length > 0);

    return { minDate, totalDays, todayOff, months, weeks, dayLines, groups };
  }, [tasks, teams]);

  /* ── Bar helpers ──────────────────────────────────────── */
  const barLeft  = dateStr => diffDays(minDate, parseDate(dateStr)) * dayW;
  const barWidth = (s, e)  => Math.max(diffDays(parseDate(s), parseDate(e)) * dayW, dayW);

  const toggle = (id) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* ── Today line (spans whole grid height) ─────────────── */
  const TodayLine = ({ height }) =>
    todayOff >= 0 && todayOff <= totalDays ? (
      <div style={{
        position: "absolute", left: todayOff * dayW, top: 0,
        width: 2, height, background: "rgba(30,58,138,0.7)",
        pointerEvents: "none", zIndex: 5,
      }}>
        <div style={{ position: "absolute", top: -2, left: -4, width: 10, height: 10, borderRadius: "50%", background: "#1e3a8a" }} />
      </div>
    ) : null;

  /* ── Gantt bar ────────────────────────────────────────── */
  function Bar({ startDate, endDate, progress, color, label, onClick, isSubtask }) {
    const h  = isSubtask ? ROW_H - 16 : ROW_H - 14;
    const mt = isSubtask ? 7 : 6;
    return (
      <div
        onClick={onClick}
        title={`${startDate} ~ ${endDate}  (${progress}%)`}
        style={{
          position: "absolute",
          left: barLeft(startDate),
          top: mt,
          width: barWidth(startDate, endDate),
          height: h,
          borderRadius: isSubtask ? 4 : 7,
          background: `${color}20`,
          border: `${isSubtask ? 1 : 1.5}px solid ${color}55`,
          overflow: "hidden",
          cursor: onClick ? "pointer" : "default",
          boxShadow: onClick ? `0 1px 4px ${color}20` : "none",
        }}
      >
        {/* Progress fill */}
        <div style={{ width: `${progress}%`, height: "100%", background: `${color}55`, transition: "width 0.3s" }} />
        {/* Label */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", paddingLeft: 7,
          fontSize: isSubtask ? 9 : 10, color, fontWeight: 600,
          whiteSpace: "nowrap", overflow: "hidden",
        }}>
          {progress > 15 ? `${progress}%` : ""}
        </div>
      </div>
    );
  }

  /* ── Row left cell ────────────────────────────────────── */
  function LeftCell({ children, bg, sticky = true }) {
    return (
      <div style={{
        width: LEFT_W, flexShrink: 0,
        ...(sticky ? { position: "sticky", left: 0, zIndex: 10 } : {}),
        background: bg || "#fff",
        borderRight: "2px solid #e2e8f0",
        display: "flex", alignItems: "center",
        padding: "0 14px", gap: 6,
        overflow: "hidden",
      }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div style={{
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 10,
        background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>📊 간트 차트</span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>팀별 과제와 하위과제를 타임라인으로 확인하세요</span>
        <div style={{ flex: 1 }} />

        {/* Legend */}
        {[["완료","#0891b2"],["진행중","#2563eb"],["대기","#94a3b8"]].map(([l,c]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#64748b" }}>
            <span style={{ width:10, height:10, borderRadius:2, background:`${c}55`, border:`1.5px solid ${c}`, display:"inline-block" }} />
            {l}
          </div>
        ))}

        {/* Zoom */}
        <div style={{ display:"flex", alignItems:"center", background:"#f1f5f9", borderRadius:8, padding:2, gap:1 }}>
          {[["축소",0.55],["기본",1],["확대",1.7]].map(([l,z]) => (
            <button key={l} onClick={() => setZoom(z)} style={{
              background: zoom===z ? "#fff" : "transparent", border:"none", borderRadius:6,
              padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight: zoom===z ? 600 : 400,
              color: zoom===z ? "#2563eb" : "#64748b",
            }}>{l}</button>
          ))}
        </div>

        <button onClick={() => setExpanded(new Set(tasks.map(t=>t.id)))}
          style={{ background:"rgba(37,99,235,0.06)", border:"1px solid rgba(37,99,235,0.2)", borderRadius:7, padding:"5px 11px", fontSize:11, color:"#2563eb", cursor:"pointer" }}>
          ▼ 모두 펼치기
        </button>
        <button onClick={() => setExpanded(new Set())}
          style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, padding:"5px 11px", fontSize:11, color:"#64748b", cursor:"pointer" }}>
          ▶ 모두 접기
        </button>
      </div>

      {/* ── Main scrollable area ──────────────────────────── */}
      <div style={{ flex:1, overflow:"auto" }}>
        <div style={{ minWidth: LEFT_W + totalDays * dayW, position:"relative" }}>

          {/* ── Sticky header ─────────────────────────────── */}
          <div style={{ display:"flex", position:"sticky", top:0, zIndex:20, background:"#fff", borderBottom:"2px solid #e2e8f0" }}>
            {/* Left header */}
            <div style={{
              width: LEFT_W, flexShrink:0,
              position:"sticky", left:0, zIndex:30,
              background:"#fafbfc", borderRight:"2px solid #e2e8f0",
              padding:"0 14px", display:"flex", alignItems:"center",
            }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#64748b" }}>팀 / 과제 / 하위과제</span>
            </div>

            {/* Timeline header */}
            <div style={{ position:"relative", flex:1, minWidth: totalDays * dayW }}>
              {/* Month labels */}
              <div style={{ height:22, position:"relative", borderBottom:"1px solid #e2e8f0", background:"#fafbfc" }}>
                {months.map((m,i) => (
                  <div key={i} style={{
                    position:"absolute", left:m.startOff*dayW, width:(m.endOff-m.startOff)*dayW,
                    top:0, bottom:0, padding:"4px 8px",
                    fontSize:10, fontWeight:700, color:"#475569",
                    borderRight:"1px solid #e2e8f0", overflow:"hidden", whiteSpace:"nowrap",
                  }}>{m.label}</div>
                ))}
              </div>
              {/* Week labels + day grid */}
              <div style={{ height:22, position:"relative", background:"#fff" }}>
                {weeks.map((w,i) => (
                  <div key={i} style={{
                    position:"absolute", left: w.off * dayW,
                    top:0, bottom:0, fontSize:9, color:"#94a3b8",
                    padding:"4px 3px", borderLeft:"1px solid #f1f5f9", whiteSpace:"nowrap",
                  }}>{w.label}</div>
                ))}
                {/* Today marker in header */}
                {todayOff >= 0 && todayOff <= totalDays && (
                  <div style={{ position:"absolute", left: todayOff * dayW - 1, top:0, bottom:0, width:2, background:"rgba(30,58,138,0.5)", zIndex:5 }} />
                )}
              </div>
            </div>
          </div>

          {/* ── Team groups ───────────────────────────────── */}
          {groups.map(({ team, tasks: tTasks }) => {
            const totalSubsCount = tTasks.reduce((a,t) => a + (expanded.has(t.id) ? (t.subtasks||[]).length : 0), 0);
            const groupH = 34 + tTasks.length * ROW_H + totalSubsCount * (ROW_H - 8);

            return (
              <div key={team.id}>
                {/* Team header row */}
                <div style={{ display:"flex", height:34, background:`${team.color}08`, borderBottom:"1px solid #e2e8f0" }}>
                  <LeftCell bg={`${team.color}12`}>
                    <span style={{ fontSize:16 }}>{team.emoji}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:team.color }}>{team.name}</span>
                    <span style={{ fontSize:10, color:"#94a3b8", marginLeft:"auto" }}>{tTasks.length}개 과제</span>
                  </LeftCell>
                  <div style={{ flex:1, position:"relative", background:`${team.color}04` }}>
                    {/* Today line in team band */}
                    {todayOff >= 0 && todayOff <= totalDays && (
                      <div style={{ position:"absolute", left: todayOff * dayW, top:0, bottom:0, width:1.5, background:"rgba(30,58,138,0.25)", zIndex:3 }} />
                    )}
                  </div>
                </div>

                {/* Task rows */}
                {tTasks.map(task => {
                  const isExp = expanded.has(task.id);
                  const subs  = task.subtasks || [];
                  const sc    = STATUS_COLOR[task.status] || "#94a3b8";

                  return (
                    <div key={task.id}>
                      {/* Task row */}
                      <div style={{ display:"flex", height:ROW_H, background:"#fff", borderBottom:"1px solid #f1f5f9" }}>
                        <LeftCell>
                          {/* Expand toggle */}
                          {subs.length > 0 ? (
                            <button
                              onClick={e => { e.stopPropagation(); toggle(task.id); }}
                              style={{
                                background: isExp ? "rgba(37,99,235,0.08)" : "#f1f5f9",
                                border:"none", borderRadius:4, width:18, height:18,
                                cursor:"pointer", fontSize:8, color: isExp ? "#2563eb" : "#94a3b8",
                                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                              }}
                            >{isExp ? "▼" : "▶"}</button>
                          ) : (
                            <div style={{ width:18, flexShrink:0 }} />
                          )}
                          <div style={{ width:8, height:8, borderRadius:"50%", background:sc, flexShrink:0 }} />
                          <span
                            onClick={() => onSelectTask(task)}
                            title={task.title}
                            style={{ fontSize:11, color:"#1e293b", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, cursor:"pointer" }}
                          >{task.title}</span>
                          <span style={{ fontSize:9, color:"#94a3b8", flexShrink:0 }}>{task.progress}%</span>
                        </LeftCell>

                        {/* Task bar */}
                        <div style={{ flex:1, position:"relative", overflow:"visible" }}>
                          {todayOff >= 0 && todayOff <= totalDays && (
                            <div style={{ position:"absolute", left: todayOff * dayW, top:0, bottom:0, width:1.5, background:"rgba(30,58,138,0.35)", zIndex:3, pointerEvents:"none" }} />
                          )}
                          <Bar
                            startDate={task.createdAt}
                            endDate={task.dueDate}
                            progress={task.progress}
                            color={team.color}
                            onClick={() => onSelectTask(task)}
                          />
                        </div>
                      </div>

                      {/* Subtask rows */}
                      {isExp && subs.map(sub => {
                        const ssc = STATUS_COLOR[sub.status] || "#94a3b8";
                        return (
                          <div key={sub.id} style={{ display:"flex", height:ROW_H - 8, background:"#fafbfc", borderBottom:"1px solid #f1f5f9" }}>
                            <LeftCell bg="#fafbfc">
                              {/* Indent connector */}
                              <div style={{ width:18, flexShrink:0 }} />
                              <div style={{ width:12, height:12, borderLeft:"2px solid #e2e8f0", borderBottom:"2px solid #e2e8f0", marginBottom:8, flexShrink:0, alignSelf:"flex-end" }} />
                              <div style={{ width:6, height:6, borderRadius:"50%", background:ssc, flexShrink:0 }} />
                              <span
                                title={`${sub.title} (${sub.assignee})`}
                                style={{ fontSize:10, color:"#475569", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}
                              >{sub.title}</span>
                              <span style={{ fontSize:9, color:"#94a3b8", flexShrink:0 }}>{sub.progress}%</span>
                            </LeftCell>

                            {/* Subtask bar */}
                            <div style={{ flex:1, position:"relative" }}>
                              {todayOff >= 0 && todayOff <= totalDays && (
                                <div style={{ position:"absolute", left: todayOff * dayW, top:0, bottom:0, width:1.5, background:"rgba(30,58,138,0.25)", zIndex:3, pointerEvents:"none" }} />
                              )}
                              <Bar
                                startDate={sub.startDate}
                                endDate={sub.dueDate}
                                progress={sub.progress}
                                color={team.color}
                                isSubtask
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer: today info ────────────────────────────── */}
      <div style={{ padding:"8px 20px", borderTop:"1px solid #e2e8f0", background:"#fff", display:"flex", alignItems:"center", gap:12, fontSize:11, color:"#94a3b8", flexShrink:0 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#1e3a8a" }} />
        <span>오늘: {toDateStr(today)}</span>
        <span style={{ marginLeft:8 }}>
          빨간 세로선이 오늘 날짜 · 과제명을 클릭하면 상세 보기
        </span>
      </div>
    </div>
  );
}
