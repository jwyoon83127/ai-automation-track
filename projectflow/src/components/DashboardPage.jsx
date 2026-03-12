import { useMemo } from "react";
import { priorityConfig } from "../constants";

/* ── Helpers ───────────────────────────────────────── */
function daysUntil(dateStr) {
  const due   = new Date(dateStr);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

/* ── Sub-components ────────────────────────────────── */

function KpiCard({ icon, label, value, sub, color, bg }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
      padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(15,23,42,0.04)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{title}</span>
        {action}
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}

function ProgBar({ value, color, height = 7, bg = "#f1f5f9" }) {
  return (
    <div style={{ background: bg, borderRadius: height, overflow: "hidden", height }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: height, transition: "width 0.4s" }} />
    </div>
  );
}

function DueBadge({ days }) {
  if (days < 0)  return <span style={{ fontSize: 10, fontWeight: 700, color: "#1e3a8a", background: "#fef2f2", padding: "2px 7px", borderRadius: 6 }}>{Math.abs(days)}일 초과</span>;
  if (days === 0) return <span style={{ fontSize: 10, fontWeight: 700, color: "#1e3a8a", background: "#fef2f2", padding: "2px 7px", borderRadius: 6 }}>오늘 마감</span>;
  if (days <= 3)  return <span style={{ fontSize: 10, fontWeight: 700, color: "#0ea5e9", background: "#fffbeb", padding: "2px 7px", borderRadius: 6 }}>D-{days}</span>;
  return <span style={{ fontSize: 10, color: "#64748b", background: "#f1f5f9", padding: "2px 7px", borderRadius: 6 }}>D-{days}</span>;
}

/* ─────────────────────────────────────────────────────
   Main DashboardPage
───────────────────────────────────────────────────── */
export default function DashboardPage({ tasks, teams, onSelectTask }) {
  const today = new Date();

  /* ── Computed data ─────────────────────────────── */
  const { stats, teamStats, upcoming, overdue, lowProgress, recentDone, totalSubtasks, doneSubtasks } = useMemo(() => {
    const done       = tasks.filter(t => t.status === "완료");
    const wip        = tasks.filter(t => t.status === "진행중");
    const waiting    = tasks.filter(t => t.status === "대기");
    const over       = tasks.filter(t => daysUntil(t.dueDate) < 0 && t.status !== "완료");

    // Upcoming: not done, due within 14 days, sorted by dueDate
    const upcoming = tasks
      .filter(t => t.status !== "완료" && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 14)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Low progress in-progress tasks
    const lowProgress = wip.sort((a, b) => a.progress - b.progress).slice(0, 5);

    // Recent done: last 5 completed
    const recentDone = done.slice(-5).reverse();

    // Team stats
    const teamStats = teams.map(team => {
      const tt  = tasks.filter(t => t.teamId === team.id);
      const td  = tt.filter(t => t.status === "완료").length;
      const ti  = tt.filter(t => t.status === "진행중").length;
      const avg = tt.length ? Math.round(tt.reduce((a, t) => a + t.progress, 0) / tt.length) : 0;
      return { team, total: tt.length, done: td, inProgress: ti, avg };
    });

    // Subtask stats
    const allSubs  = tasks.flatMap(t => t.subtasks || []);
    const doneSubs = allSubs.filter(s => s.status === "완료").length;

    return {
      stats: { total: tasks.length, done: done.length, wip: wip.length, waiting: waiting.length, overdue: over.length,
               doneRate: Math.round((done.length / tasks.length) * 100),
               avgProgress: Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length) },
      teamStats,
      upcoming,
      overdue: over.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5),
      lowProgress,
      recentDone,
      totalSubtasks: allSubs.length,
      doneSubtasks: doneSubs,
    };
  }, [tasks, teams]);

  const getTeam = id => teams.find(t => t.id === id);

  /* ── Donut chart (SVG-based) ───────────────────── */
  const R = 42, CX = 56, CY = 56, STROKE = 10;
  const circumference = 2 * Math.PI * R;
  const offset = circumference - (stats.doneRate / 100) * circumference;

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── KPI cards ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        <KpiCard icon="📋" label="전체 업무"   value={stats.total}        color="#1e293b"  bg="#f1f5f9"            sub={`하위과제 ${totalSubtasks}건 포함`} />
        <KpiCard icon="✅" label="완료"        value={stats.done}         color="#0891b2"  bg="rgba(8,145,178,0.1)"  sub={`완료율 ${stats.doneRate}%`} />
        <KpiCard icon="⚡" label="진행중"      value={stats.wip}          color="#2563eb"  bg="rgba(37,99,235,0.1)"  sub={`평균 진행률 ${stats.avgProgress}%`} />
        <KpiCard icon="⏳" label="대기"        value={stats.waiting}      color="#0ea5e9"  bg="rgba(14,165,233,0.1)"  sub="시작 전 업무" />
        <KpiCard icon="⚠️" label="마감 초과"   value={stats.overdue}      color={stats.overdue > 0 ? "#1e3a8a" : "#0891b2"} bg={stats.overdue > 0 ? "rgba(30,58,138,0.1)" : "rgba(8,145,178,0.1)"} sub={stats.overdue > 0 ? "즉시 확인 필요" : "정상 진행 중"} />
      </div>

      {/* ── Row 2: 전체 진행률 + 팀별 현황 ─────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>

        {/* Donut + overall progress */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(15,23,42,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", alignSelf: "flex-start" }}>📊 전체 완료율</span>
          <div style={{ position: "relative" }}>
            <svg width={112} height={112} viewBox="0 0 112 112">
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#0891b2" strokeWidth={STROKE}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`}
                style={{ transition: "stroke-dashoffset 0.6s" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0891b2" }}>{stats.doneRate}%</div>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>완료</div>
            </div>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
            {[["완료", stats.done, "#0891b2"], ["진행중", stats.wip, "#2563eb"], ["대기", stats.waiting, "#0ea5e9"]].map(([label, val, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ color: "#64748b", flex: 1 }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
            {totalSubtasks > 0 && (
              <div style={{ marginTop: 4, paddingTop: 8, borderTop: "1px solid #f1f5f9", fontSize: 10, color: "#94a3b8", textAlign: "center" }}>
                하위과제 {doneSubtasks}/{totalSubtasks} 완료
              </div>
            )}
          </div>
        </div>

        {/* Team progress */}
        <SectionCard title="👥 팀별 진행 현황">
          <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {teamStats.map(({ team, total, done, inProgress, avg }) => (
              <div key={team.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 15 }}>{team.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: team.color, flex: 1 }}>{team.name}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>완료 {done}/{total}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: avg >= 70 ? "#0891b2" : avg >= 40 ? "#2563eb" : "#0ea5e9", minWidth: 38, textAlign: "right" }}>{avg}%</span>
                </div>
                <ProgBar value={avg} color={team.color} />
                <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 10, color: "#94a3b8" }}>
                  <span>✅ {done}개 완료</span>
                  <span>⚡ {inProgress}개 진행</span>
                  <span>⏳ {total - done - inProgress}개 대기</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Row 3: 마감 임박 + 마감 초과 ─────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {/* Upcoming */}
        <SectionCard
          title="📅 마감 임박 업무 (14일 이내)"
          action={<span style={{ fontSize: 11, color: upcoming.length > 0 ? "#0ea5e9" : "#0891b2", fontWeight: 600 }}>{upcoming.length}건</span>}
        >
          {upcoming.length === 0 ? (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>마감 임박 업무가 없습니다 🎉</div>
          ) : (
            <div>
              {upcoming.map(task => {
                const team = getTeam(task.teamId);
                const d = daysUntil(task.dueDate);
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    style={{ padding: "10px 18px", borderBottom: "1px solid #f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: team?.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{task.assignee} · {priorityConfig[task.priority]?.label} {task.priority}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                      <DueBadge days={d} />
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{task.progress}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Overdue */}
        <SectionCard
          title="⚠️ 마감 초과 업무"
          action={<span style={{ fontSize: 11, color: overdue.length > 0 ? "#1e3a8a" : "#0891b2", fontWeight: 600 }}>{overdue.length}건</span>}
        >
          {overdue.length === 0 ? (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "#0891b2", fontSize: 12 }}>마감 초과 업무 없음 ✅</div>
          ) : (
            <div>
              {overdue.map(task => {
                const team = getTeam(task.teamId);
                const d = daysUntil(task.dueDate);
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    style={{ padding: "10px 18px", borderBottom: "1px solid #f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: "rgba(30,58,138,0.02)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(30,58,138,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(30,58,138,0.02)"}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1e3a8a", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{task.assignee} · {team?.name}</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <DueBadge days={d} />
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{task.progress}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Row 4: 낮은 진행률 + 최근 완료 ──────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {/* Low progress */}
        <SectionCard title="🐢 집중 필요 업무 (낮은 진행률 순)">
          {lowProgress.length === 0 ? (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>진행 중인 업무가 없습니다</div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {lowProgress.map(task => {
                const team = getTeam(task.teamId);
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    style={{ padding: "8px 18px", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#1e293b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</span>
                      <span style={{ fontSize: 10, color: team?.color }}>{team?.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: task.progress < 20 ? "#1e3a8a" : task.progress < 50 ? "#0ea5e9" : "#2563eb", flexShrink: 0 }}>{task.progress}%</span>
                    </div>
                    <ProgBar value={task.progress} color={task.progress < 20 ? "#1e3a8a" : task.progress < 50 ? "#0ea5e9" : "#2563eb"} />
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>담당: {task.assignee} · 마감 {daysUntil(task.dueDate) < 0 ? `${Math.abs(daysUntil(task.dueDate))}일 초과` : `D-${daysUntil(task.dueDate)}`}</div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Recent done */}
        <SectionCard title="🏆 최근 완료 업무">
          {recentDone.length === 0 ? (
            <div style={{ padding: "24px 18px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>완료된 업무가 없습니다</div>
          ) : (
            <div>
              {recentDone.map(task => {
                const team = getTeam(task.teamId);
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    style={{ padding: "10px 18px", borderBottom: "1px solid #f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(8,145,178,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✅</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{task.assignee} · {task.dueDate}</div>
                    </div>
                    <span style={{ fontSize: 10, color: team?.color, background: `${team?.color}12`, padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>{team?.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
