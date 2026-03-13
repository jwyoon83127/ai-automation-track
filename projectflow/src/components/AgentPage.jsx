import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   Project analysis engine (rule-based, data-driven)
───────────────────────────────────────────────────────────── */
function analyzeQuery(input, tasks, teams) {
  const lc = input.toLowerCase();
  const today = new Date();

  const getTeam  = id => teams.find(t => t.id === id);
  const overdue  = tasks.filter(t => new Date(t.dueDate) < today && t.status !== "완료");
  const doneList = tasks.filter(t => t.status === "완료");
  const wipList  = tasks.filter(t => t.status === "진행중");
  const stats    = {
    total:      tasks.length,
    done:       doneList.length,
    inProgress: wipList.length,
    waiting:    tasks.filter(t => t.status === "대기").length,
    doneRate:   Math.round((doneList.length / tasks.length) * 100),
    avgProgress:Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length),
  };

  /* Team stats helper */
  const teamStats = teams.map(team => {
    const tt = tasks.filter(t => t.teamId === team.id);
    const td = tt.filter(t => t.status === "완료").length;
    const ti = tt.filter(t => t.status === "진행중").length;
    const avg= tt.length ? Math.round(tt.reduce((a,t)=>a+t.progress,0)/tt.length) : 0;
    return { team, tt, td, ti, avg, tw: tt.length - td - ti };
  });

  /* Intent matching */
  const is = (...kw) => kw.some(k => lc.includes(k));

  if (is("팀별", "각 팀", "팀 별", "team")) {
    return { type: "team", teamStats, tasks };
  }
  if (is("완료", "끝난", "done")) {
    return { type: "done", doneList, teams };
  }
  if (is("진행중", "진행 중", "wip", "하고 있")) {
    return { type: "wip", wipList, teams };
  }
  if (is("지연", "늦은", "마감", "위험", "overdue")) {
    return { type: "overdue", overdue, teams };
  }
  if (is("하위", "서브", "subtask")) {
    return { type: "subtask", tasks, teams };
  }
  if (is("성과", "실적", "이번달", "이번 달", "월간")) {
    return { type: "monthly", stats, teamStats, tasks, overdue };
  }
  /* Default: overall summary */
  return { type: "overall", stats, teamStats, overdue, tasks };
}

/* ─────────────────────────────────────────────────────────────
   Message renderer
───────────────────────────────────────────────────────────── */
function AgentMessage({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <div style={{
          background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
          color: "#fff", borderRadius: "14px 14px 2px 14px",
          padding: "10px 14px", maxWidth: 480, fontSize: 13, lineHeight: 1.5,
        }}>{msg.text}</div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
      }}>🤖</div>
      <div style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "2px 14px 14px 14px", padding: "12px 16px", boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
        <AgentContent result={msg.result} />
      </div>
    </div>
  );
}

function AgentContent({ result }) {
  if (!result) return null;
  const { type } = result;

  if (type === "overall")  return <OverallView  {...result} />;
  if (type === "team")     return <TeamView     {...result} />;
  if (type === "done")     return <DoneView     {...result} />;
  if (type === "wip")      return <WipView      {...result} />;
  if (type === "overdue")  return <OverdueView  {...result} />;
  if (type === "subtask")  return <SubtaskView  {...result} />;
  if (type === "monthly")  return <MonthlyView  {...result} />;
  return null;
}

/* ── Section helpers ── */
function SectionTitle({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>{children}</div>;
}
function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: `${color}0d`, border: `1px solid ${color}25`, borderRadius: 10, padding: "10px 12px", textAlign: "center", minWidth: 70 }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
    </div>
  );
}
function ProgBar({ value, color, height = 6 }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: height, overflow: "hidden", height }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: height, transition: "width 0.4s" }} />
    </div>
  );
}
function TaskRow({ task, team }) {
  const sc = task.status === "완료" ? "#0891b2" : task.status === "진행중" ? "#2563eb" : "#94a3b8";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 12, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
      <div style={{ fontSize: 10, color: team?.color || "#94a3b8", background: `${team?.color}15`, padding: "1px 7px", borderRadius: 6, flexShrink: 0 }}>{team?.name}</div>
      <div style={{ fontSize: 11, color: sc, flexShrink: 0, fontWeight: 600 }}>{task.progress}%</div>
    </div>
  );
}

/* ── View components ── */
function OverallView({ stats, teamStats, overdue }) {
  return (
    <div>
      <SectionTitle>📊 전체 프로젝트 현황</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard label="전체 업무" value={stats.total}      color="#2563eb" icon="📋" />
        <StatCard label="완료"      value={stats.done}       color="#0891b2" icon="✅" />
        <StatCard label="진행중"    value={stats.inProgress} color="#1e3a8a" icon="⚡" />
        <StatCard label="대기"      value={stats.waiting}    color="#0ea5e9" icon="⏳" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          <span>전체 완료율</span><span style={{ fontWeight: 700, color: "#0891b2" }}>{stats.doneRate}%</span>
        </div>
        <ProgBar value={stats.doneRate} color="#0891b2" height={8} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginTop: 8, marginBottom: 4 }}>
          <span>평균 진행률</span><span style={{ fontWeight: 700, color: "#2563eb" }}>{stats.avgProgress}%</span>
        </div>
        <ProgBar value={stats.avgProgress} color="#2563eb" height={8} />
      </div>
      {overdue.length > 0 && (
        <div style={{ background: "rgba(30,58,138,0.06)", border: "1px solid rgba(30,58,138,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#1e3a8a" }}>
          ⚠️ 마감 초과 업무 {overdue.length}건이 있습니다. 즉각적인 확인이 필요합니다.
        </div>
      )}
      {overdue.length === 0 && (
        <div style={{ background: "rgba(8,145,178,0.06)", border: "1px solid rgba(8,145,178,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#0891b2" }}>
          ✅ 현재 마감 초과 업무 없음. 일정이 순조롭게 진행 중입니다.
        </div>
      )}
    </div>
  );
}

function TeamView({ teamStats }) {
  return (
    <div>
      <SectionTitle>👥 팀별 진행 현황</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {teamStats.map(({ team, tt, td, ti, tw, avg }) => (
          <div key={team.id} style={{ background: `${team.color}06`, border: `1px solid ${team.color}20`, borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{team.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: team.color }}>{team.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#64748b" }}>총 {tt.length}개</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: avg >= 70 ? "#0891b2" : avg >= 40 ? "#2563eb" : "#0ea5e9" }}>{avg}%</span>
            </div>
            <ProgBar value={avg} color={team.color} />
            <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: "#64748b" }}>
              <span>✅ 완료 {td}</span>
              <span>⚡ 진행중 {ti}</span>
              <span>⏳ 대기 {tw}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoneView({ doneList, teams }) {
  const getTeam = id => teams.find(t => t.id === id);
  return (
    <div>
      <SectionTitle>✅ 완료된 업무 ({doneList.length}건)</SectionTitle>
      {doneList.length === 0
        ? <div style={{ color: "#94a3b8", fontSize: 12 }}>완료된 업무가 없습니다.</div>
        : doneList.map(t => <TaskRow key={t.id} task={t} team={getTeam(t.teamId)} />)
      }
    </div>
  );
}

function WipView({ wipList, teams }) {
  const getTeam = id => teams.find(t => t.id === id);
  return (
    <div>
      <SectionTitle>⚡ 진행 중인 업무 ({wipList.length}건)</SectionTitle>
      {wipList.length === 0
        ? <div style={{ color: "#94a3b8", fontSize: 12 }}>진행 중인 업무가 없습니다.</div>
        : [...wipList].sort((a, b) => b.progress - a.progress).map(t => (
            <div key={t.id}>
              <TaskRow task={t} team={getTeam(t.teamId)} />
              <div style={{ paddingLeft: 14, marginBottom: 4 }}>
                <ProgBar value={t.progress} color={getTeam(t.teamId)?.color || "#2563eb"} />
              </div>
            </div>
          ))
      }
    </div>
  );
}

function OverdueView({ overdue, teams }) {
  const getTeam = id => teams.find(t => t.id === id);
  const today = new Date();
  if (overdue.length === 0) {
    return (
      <div>
        <SectionTitle>🎯 마감 위험 업무</SectionTitle>
        <div style={{ background: "rgba(8,145,178,0.06)", border: "1px solid rgba(8,145,178,0.2)", borderRadius: 10, padding: "14px", textAlign: "center", fontSize: 13, color: "#0891b2" }}>
          모든 업무가 일정 내에 진행 중입니다! 👍
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionTitle>⚠️ 마감 초과·위험 업무 ({overdue.length}건)</SectionTitle>
      {overdue.map(t => {
        const daysOver = Math.round((today - new Date(t.dueDate)) / 86400000);
        const team = getTeam(t.teamId);
        return (
          <div key={t.id} style={{ background: "rgba(30,58,138,0.04)", border: "1px solid rgba(30,58,138,0.15)", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, background: "#fef2f2", color: "#1e3a8a", padding: "1px 7px", borderRadius: 6, fontWeight: 600 }}>+{daysOver}일 초과</span>
              <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{t.title}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: team?.color }}>{team?.name}</span>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>담당: {t.assignee} · 마감: {t.dueDate} · {t.progress}% 완료</div>
          </div>
        );
      })}
    </div>
  );
}

function SubtaskView({ tasks, teams }) {
  const getTeam = id => teams.find(t => t.id === id);
  const allSubs = tasks.flatMap(t =>
    (t.subtasks || []).map(s => ({ ...s, parentTitle: t.title, team: getTeam(t.teamId) }))
  );
  const done = allSubs.filter(s => s.status === "완료").length;
  const wip  = allSubs.filter(s => s.status === "진행중").length;
  return (
    <div>
      <SectionTitle>🔀 하위과제 현황 (총 {allSubs.length}건)</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <StatCard label="완료"   value={done}               color="#0891b2" icon="✅" />
        <StatCard label="진행중" value={wip}                color="#2563eb" icon="⚡" />
        <StatCard label="대기"   value={allSubs.length-done-wip} color="#94a3b8" icon="⏳" />
      </div>
      {tasks.filter(t => (t.subtasks||[]).length > 0).map(t => {
        const team = getTeam(t.teamId);
        const subs = t.subtasks || [];
        const sdone = subs.filter(s => s.status === "완료").length;
        return (
          <div key={t.id} style={{ marginBottom: 8, border: "1px solid #f1f5f9", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: `${team?.color}10`, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: team?.color }}>{team?.emoji} {t.title}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#64748b" }}>{sdone}/{subs.length} 완료</span>
            </div>
            {subs.map(s => {
              const sc = s.status === "완료" ? "#0891b2" : s.status === "진행중" ? "#2563eb" : "#94a3b8";
              return (
                <div key={s.id} style={{ padding: "5px 12px 5px 24px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #f8fafc" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: sc, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#475569", flex: 1 }}>{s.title}</span>
                  <span style={{ fontSize: 10, color: sc, fontWeight: 600 }}>{s.progress}%</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function MonthlyView({ stats, teamStats, overdue }) {
  const topTeam = [...teamStats].sort((a, b) => b.avg - a.avg)[0];
  const score   = Math.round((stats.doneRate * 0.5) + (stats.avgProgress * 0.3) + ((1 - overdue.length / Math.max(stats.total, 1)) * 100 * 0.2));
  const grade   = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
  const gradeColor = { A: "#0891b2", B: "#2563eb", C: "#0ea5e9", D: "#1e3a8a" }[grade];

  return (
    <div>
      <SectionTitle>🏆 이번 달 프로젝트 성과 요약</SectionTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, background: `${gradeColor}08`, border: `1px solid ${gradeColor}25`, borderRadius: 12, padding: "12px 16px" }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>종합 성과 점수: {score}점</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>완료율 {stats.doneRate}% · 평균 진행률 {stats.avgProgress}% · 지연 {overdue.length}건</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <StatCard label="완료 업무" value={stats.done}       color="#0891b2" icon="✅" />
        <StatCard label="진행중"    value={stats.inProgress} color="#2563eb" icon="⚡" />
        <StatCard label="지연"      value={overdue.length}   color="#1e3a8a" icon="⚠️" />
        <StatCard label="완료율"    value={`${stats.doneRate}%`} color="#1e3a8a" icon="📈" />
      </div>
      {topTeam && (
        <div style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🥇</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: topTeam.team.color }}>이달의 최우수 팀: {topTeam.team.emoji} {topTeam.team.name}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>평균 진행률 {topTeam.avg}% · 완료 {topTeam.td}건</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PDF Report Generator
───────────────────────────────────────────────────────────── */
function generatePDF(tasks, teams) {
  const today = new Date();
  const fmt   = d => d.toLocaleDateString("ko-KR");
  const getTeam = id => teams.find(t => t.id === id);

  const stats = {
    total:      tasks.length,
    done:       tasks.filter(t => t.status === "완료").length,
    inProgress: tasks.filter(t => t.status === "진행중").length,
    waiting:    tasks.filter(t => t.status === "대기").length,
    avgProgress:Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length),
  };
  const doneRate = Math.round((stats.done / stats.total) * 100);
  const overdue  = tasks.filter(t => new Date(t.dueDate) < today && t.status !== "완료");

  const teamRows = teams.map(team => {
    const tt  = tasks.filter(t => t.teamId === team.id);
    const td  = tt.filter(t => t.status === "완료").length;
    const avg = tt.length ? Math.round(tt.reduce((a,t)=>a+t.progress,0)/tt.length) : 0;
    return `
      <tr>
        <td>${team.emoji} ${team.name}</td>
        <td style="text-align:center">${tt.length}</td>
        <td style="text-align:center;color:#0891b2;font-weight:bold">${td}</td>
        <td style="text-align:center;color:#2563eb">${tt.filter(t=>t.status==="진행중").length}</td>
        <td style="text-align:center;color:#94a3b8">${tt.filter(t=>t.status==="대기").length}</td>
        <td>
          <div style="background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden">
            <div style="width:${avg}%;height:100%;background:${team.color};border-radius:4px"></div>
          </div>
          <span style="font-size:11px;color:${team.color};font-weight:bold">${avg}%</span>
        </td>
      </tr>`;
  }).join("");

  const taskRows = tasks.map(t => {
    const team = getTeam(t.teamId);
    const sc   = t.status === "완료" ? "#0891b2" : t.status === "진행중" ? "#2563eb" : "#94a3b8";
    return `
      <tr>
        <td>${t.title}</td>
        <td style="color:${team?.color}">${team?.name}</td>
        <td>${t.assignee}</td>
        <td style="color:${sc};font-weight:bold">${t.status}</td>
        <td style="text-align:center">${t.dueDate}</td>
        <td style="text-align:center;color:${sc};font-weight:bold">${t.progress}%</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>ProjectFlow 프로젝트 리포트</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Noto Sans KR',Arial,sans-serif; color:#1e293b; padding:32px; font-size:13px; }
    .header { display:flex; align-items:center; justify-content:space-between; border-bottom:3px solid #2563eb; padding-bottom:16px; margin-bottom:24px; }
    .logo { font-size:22px; font-weight:900; color:#2563eb; }
    .meta { font-size:11px; color:#94a3b8; text-align:right; }
    h2 { font-size:15px; font-weight:700; color:#1e293b; margin:24px 0 12px; padding-left:10px; border-left:4px solid #2563eb; }
    .stat-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:20px; }
    .stat-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; text-align:center; }
    .stat-val { font-size:24px; font-weight:800; }
    .stat-lbl { font-size:10px; color:#64748b; margin-top:2px; }
    .prog-wrap { margin-bottom:16px; }
    .prog-bar-bg { background:#e2e8f0; border-radius:6px; height:10px; overflow:hidden; }
    .prog-bar { height:100%; border-radius:6px; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    th { background:#2563eb; color:#fff; padding:8px 10px; font-size:11px; text-align:left; }
    td { padding:7px 10px; border-bottom:1px solid #f1f5f9; font-size:12px; }
    tr:nth-child(even) td { background:#fafbfc; }
    .alert { background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 14px; color:#1e3a8a; font-size:12px; margin-bottom:16px; }
    .ok { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 14px; color:#0891b2; font-size:12px; margin-bottom:16px; }
    .footer { margin-top:32px; padding-top:14px; border-top:1px solid #e2e8f0; font-size:10px; color:#94a3b8; text-align:center; }
    @media print {
      body { padding:16px; }
      @page { margin:15mm; size:A4; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">⚡ ProjectFlow</div>
      <div style="font-size:12px;color:#475569;margin-top:4px">프로젝트 현황 리포트</div>
    </div>
    <div class="meta">생성일시: ${fmt(today)}<br>기준 데이터: 전체 ${stats.total}개 업무</div>
  </div>

  <h2>📊 프로젝트 종합 현황</h2>
  <div class="stat-grid">
    <div class="stat-card"><div class="stat-val" style="color:#2563eb">${stats.total}</div><div class="stat-lbl">전체 업무</div></div>
    <div class="stat-card"><div class="stat-val" style="color:#0891b2">${stats.done}</div><div class="stat-lbl">완료</div></div>
    <div class="stat-card"><div class="stat-val" style="color:#1e3a8a">${stats.inProgress}</div><div class="stat-lbl">진행중</div></div>
    <div class="stat-card"><div class="stat-val" style="color:#0ea5e9">${stats.waiting}</div><div class="stat-lbl">대기</div></div>
    <div class="stat-card"><div class="stat-val" style="color:#1e3a8a">${overdue.length}</div><div class="stat-lbl">마감 초과</div></div>
  </div>
  <div class="prog-wrap">
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span>전체 완료율</span><span style="color:#0891b2;font-weight:bold">${doneRate}%</span></div>
    <div class="prog-bar-bg"><div class="prog-bar" style="width:${doneRate}%;background:#0891b2"></div></div>
  </div>
  <div class="prog-wrap">
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span>평균 진행률</span><span style="color:#2563eb;font-weight:bold">${stats.avgProgress}%</span></div>
    <div class="prog-bar-bg"><div class="prog-bar" style="width:${stats.avgProgress}%;background:#2563eb"></div></div>
  </div>

  ${overdue.length > 0
    ? `<div class="alert">⚠️ 마감 초과 업무 ${overdue.length}건 (${overdue.map(t=>t.title).join(", ")})</div>`
    : `<div class="ok">✅ 현재 마감 초과 업무 없음. 일정이 순조롭게 진행 중입니다.</div>`
  }

  <h2>👥 팀별 업무 현황</h2>
  <table>
    <thead><tr><th>팀</th><th>전체</th><th>완료</th><th>진행중</th><th>대기</th><th>진행률</th></tr></thead>
    <tbody>${teamRows}</tbody>
  </table>

  <h2>📋 전체 업무 목록</h2>
  <table>
    <thead><tr><th>업무명</th><th>팀</th><th>담당자</th><th>상태</th><th>마감일</th><th>진행률</th></tr></thead>
    <tbody>${taskRows}</tbody>
  </table>

  <div class="footer">
    ProjectFlow · 자동 생성 리포트 · ${fmt(today)} 기준
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  window.open(url, "_blank");
  // Revoke after 3s — enough time for the new tab to load the blob
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

/* ─────────────────────────────────────────────────────────────
   Main AgentPage
───────────────────────────────────────────────────────────── */
const QUICK_PROMPTS = [
  { label: "전체 현황 요약",   text: "전체 프로젝트 현황을 요약해줘" },
  { label: "팀별 진행상황",    text: "팀별 진행 상황 알려줘" },
  { label: "진행중 업무",      text: "현재 진행중인 업무 보여줘" },
  { label: "완료된 업무",      text: "완료된 업무 목록 보여줘" },
  { label: "지연 위험 확인",   text: "마감 지연 위험 업무가 있어?" },
  { label: "하위과제 현황",    text: "하위과제 현황 알려줘" },
  { label: "이번 달 성과",     text: "이번 달 프로젝트 성과 요약해줘" },
];

const WELCOME = {
  role: "agent",
  result: null,
  text: null,
  isWelcome: true,
};

export default function AgentPage({ tasks, teams }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate thinking delay
    setTimeout(() => {
      const result = analyzeQuery(text, tasks, teams);
      setMessages(prev => {
        const next = [...prev, { role: "agent", result }];
        return next.length > 100 ? next.slice(next.length - 100) : next;
      });
      setLoading(false);
    }, 600);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>

      {/* ── Top bar ─────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#1e3a8a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>ProjectFlow 에이전트</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>프로젝트 현황 분석 · 자연어 질문 · 리포트 다운로드</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            onClick={() => generatePDF(tasks, teams)}
            style={{
              background: "linear-gradient(135deg,#2563eb,#1e3a8a)", border: "none", borderRadius: 9,
              padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >📄 PDF 리포트 다운로드</button>
          <button
            onClick={() => setMessages([WELCOME])}
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, padding: "8px 14px", fontSize: 12, color: "#64748b", cursor: "pointer" }}
          >대화 초기화</button>
        </div>
      </div>

      {/* ── Chat area ───────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

        {/* Welcome card */}
        {messages[0]?.isWelcome && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 24px", marginBottom: 20, maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#1e3a8a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>안녕하세요! ProjectFlow 에이전트입니다.</div>
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 14 }}>
              프로젝트 진행 현황을 자연어로 질문하면 분석 결과를 알려드려요.<br />
              아래 빠른 질문을 눌러보거나 직접 입력해 보세요.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  onClick={() => send(p.text)}
                  style={{
                    background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 20,
                    padding: "5px 13px", fontSize: 12, color: "#2563eb", cursor: "pointer",
                  }}
                >{p.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.filter(m => !m.isWelcome).map((msg, i) => (
          <AgentMessage key={i} msg={msg} />
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#1e3a8a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "2px 14px 14px 14px", padding: "14px 18px" }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#2563eb",
                    animation: `bounce 1s ${i * 0.2}s infinite`,
                    opacity: 0.7,
                  }} />
                ))}
              </div>
              <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick prompts ────────────────────────────────── */}
      <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "8px 20px", display: "flex", gap: 6, overflowX: "auto", flexShrink: 0 }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p.label}
            onClick={() => send(p.text)}
            style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 20, whiteSpace: "nowrap",
              padding: "4px 12px", fontSize: 11, color: "#64748b", cursor: "pointer", flexShrink: 0,
            }}
          >{p.label}</button>
        ))}
      </div>

      {/* ── Input ───────────────────────────────────────── */}
      <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="프로젝트에 대해 자유롭게 질문하세요... (Enter로 전송, Shift+Enter 줄바꿈)"
          rows={2}
          style={{
            flex: 1, border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px",
            fontSize: 13, color: "#1e293b", resize: "none", outline: "none",
            fontFamily: "inherit", lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? "linear-gradient(135deg,#2563eb,#1e3a8a)" : "#e2e8f0",
            border: "none", borderRadius: 12, width: 44, height: 44,
            color: input.trim() && !loading ? "#fff" : "#94a3b8",
            fontSize: 18, cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", flexShrink: 0,
          }}
        >➤</button>
      </div>
    </div>
  );
}
