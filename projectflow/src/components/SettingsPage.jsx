import { useState } from "react";
import { ROLES, PERMISSIONS, C } from "../constants";
import Avatar from "./Avatar";

export default function SettingsPage({ data, setData, currentUser, onClose }) {
  const [tab, setTab]         = useState("users");
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEdit]   = useState(null);
  const [search, setSearch]   = useState("");
  const [roleF, setRoleF]     = useState("전체");
  const [nu, setNu]           = useState({ name: "", email: "", role: "member", teamId: "", status: "활성" });

  const canManage = PERMISSIONS[currentUser.role].manageUsers;
  const filtered = data.users.filter(u =>
    (!search || u.name.includes(search) || u.email.includes(search)) &&
    (roleF === "전체" || u.role === roleF)
  );
  const teamOf = (id) => data.teams.find(t => t.id === id);

  const doAdd = () => {
    if (!nu.name || !nu.email) return;
    setData(d => ({ ...d, users: [...d.users, { ...nu, id: Date.now(), teamId: nu.teamId ? Number(nu.teamId) : null, joinedAt: new Date().toISOString().split("T")[0] }] }));
    setShowAdd(false);
    setNu({ name: "", email: "", role: "member", teamId: "", status: "활성" });
  };
  const doSave   = () => { setData(d => ({ ...d, users: d.users.map(u => u.id === editUser.id ? editUser : u) })); setEdit(null); };
  const doDel    = (uid) => { if (uid === currentUser.id) { alert("자기 자신은 삭제할 수 없습니다."); return; } setData(d => ({ ...d, users: d.users.filter(u => u.id !== uid) })); };
  const doRole   = (uid, role) => { if (uid === currentUser.id) { alert("자신의 권한은 변경할 수 없습니다."); return; } setData(d => ({ ...d, users: d.users.map(u => u.id === uid ? { ...u, role } : u) })); };
  const doToggle = (uid) => { if (uid === currentUser.id) return; setData(d => ({ ...d, users: d.users.map(u => u.id === uid ? { ...u, status: u.status === "활성" ? "비활성" : "활성" } : u) })); };

  const tabs = [
    { id: "users",   label: "사용자 관리", icon: "👥" },
    { id: "roles",   label: "권한 안내",   icon: "🔐" },
    { id: "account", label: "내 계정",     icon: "👤" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 22, width: "100%", maxWidth: 870, height: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(15,23,42,0.18)" }}>

        {/* Header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12, background: "#ffffff" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#1e3a8a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚙️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>설정</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>시스템 환경 및 사용자·권한 관리</div>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={C.xbtn}>✕</button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <div style={{ width: 185, borderRight: "1px solid #f1f5f9", padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3, background: "#fafbfc" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? "rgba(37,99,235,0.08)" : "transparent", border: tab === t.id ? "1px solid rgba(37,99,235,0.2)" : "1px solid transparent", borderRadius: 9, padding: "9px 12px", textAlign: "left", color: tab === t.id ? "#2563eb" : "#64748b", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                {t.icon} {t.label}
              </button>
            ))}
            <div style={{ marginTop: "auto", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 10px" }}>
              <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>현재 사용자</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={currentUser.name} size={28} color={ROLES[currentUser.role].color} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{currentUser.name}</div>
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: ROLES[currentUser.role].bg, color: ROLES[currentUser.role].color }}>{ROLES[currentUser.role].label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", background: "#ffffff" }}>

            {/* 사용자 관리 */}
            {tab === "users" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>사용자 관리</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>총 {data.users.length}명 · 활성 {data.users.filter(u => u.status === "활성").length}명</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, opacity: 0.4 }}>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름·이메일 검색" style={{ ...C.inp, width: 150, padding: "6px 10px 6px 24px", fontSize: 12 }} />
                  </div>
                  <select value={roleF} onChange={e => setRoleF(e.target.value)} style={{ ...C.inp, width: 95, padding: "6px 10px", fontSize: 12 }}>
                    <option>전체</option>
                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  {canManage && <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(135deg,#2563eb,#1e3a8a)", border: "none", borderRadius: 8, padding: "7px 13px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>+ 사용자 추가</button>}
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 2.2fr 1fr 1.1fr 1fr 100px", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, background: "#fafbfc" }}>
                    <span>사용자</span><span>이메일</span><span>팀</span><span>권한</span><span>상태</span><span style={{ textAlign: "right" }}>액션</span>
                  </div>
                  {filtered.length === 0 && <div style={{ padding: "30px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>검색 결과가 없습니다</div>}
                  {filtered.map((user, i) => {
                    const role = ROLES[user.role];
                    const team = teamOf(user.teamId);
                    const isMe = user.id === currentUser.id;
                    return (
                      <div key={user.id} style={{ display: "grid", gridTemplateColumns: "2fr 2.2fr 1fr 1.1fr 1fr 100px", alignItems: "center", padding: "11px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none", background: isMe ? "rgba(37,99,235,0.03)" : "transparent" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar name={user.name} size={30} color={role.color} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: "#1e293b" }}>{user.name}{isMe && <span style={{ fontSize: 10, color: "#2563eb", marginLeft: 5 }}>(나)</span>}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>{user.joinedAt}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                        <div>{team ? <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 9, background: `${team.color}15`, color: team.color }}>{team.emoji} {team.name}</span> : <span style={{ color: "#cbd5e1", fontSize: 11 }}>-</span>}</div>
                        <div>
                          {canManage && !isMe
                            ? <select value={user.role} onChange={e => doRole(user.id, e.target.value)} style={{ background: "transparent", border: `1px solid ${role.color}60`, borderRadius: 8, padding: "3px 7px", color: role.color, fontSize: 11, cursor: "pointer", outline: "none" }}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                            : <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: role.bg, color: role.color }}>{role.icon} {role.label}</span>}
                        </div>
                        <div>
                          {canManage && !isMe
                            ? <button onClick={() => doToggle(user.id)} style={{ background: user.status === "활성" ? "rgba(8,145,178,0.08)" : "rgba(100,116,139,0.08)", border: user.status === "활성" ? "1px solid rgba(8,145,178,0.3)" : "1px solid #e2e8f0", borderRadius: 8, padding: "3px 9px", color: user.status === "활성" ? "#0891b2" : "#94a3b8", fontSize: 11, cursor: "pointer" }}>{user.status === "활성" ? "● 활성" : "○ 비활성"}</button>
                            : <span style={{ fontSize: 11, color: user.status === "활성" ? "#0891b2" : "#94a3b8" }}>{user.status === "활성" ? "● 활성" : "○ 비활성"}</span>}
                        </div>
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                          {canManage && <>
                            <button onClick={() => setEdit({ ...user })} onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", color: "#64748b", fontSize: 11, cursor: "pointer" }}>수정</button>
                            {!isMe && <button onClick={() => doDel(user.id)} onMouseEnter={e => { e.currentTarget.style.background = "rgba(30,58,138,0.08)"; e.currentTarget.style.color = "#1e3a8a"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }} style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", color: "#64748b", fontSize: 11, cursor: "pointer", transition: "all 0.2s" }}>삭제</button>}
                          </>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 권한 안내 */}
            {tab === "roles" && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>권한 체계</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>각 역할별 접근 가능한 기능을 확인하세요</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                  {Object.entries(ROLES).map(([key, role]) => (
                    <div key={key} style={{ background: "#fafbfc", border: `1px solid ${role.color}25`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: role.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{role.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: role.color }}>{role.label}</span>
                          {currentUser.role === key && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>내 권한</span>}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 9 }}>{role.desc}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {Object.entries(PERMISSIONS[key]).map(([perm, ok]) => {
                            const labels = { addTask: "업무 추가", editTask: "업무 수정", deleteTask: "업무 삭제", addTeam: "팀 추가", manageUsers: "사용자 관리" };
                            return <span key={perm} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 8, background: ok ? "rgba(8,145,178,0.08)" : "rgba(100,116,139,0.06)", color: ok ? "#0891b2" : "#94a3b8", border: ok ? "1px solid rgba(8,145,178,0.2)" : "1px solid #e2e8f0" }}>{ok ? "✓" : "✗"} {labels[perm]}</span>;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>권한 매트릭스</div>
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(4,1fr)", padding: "9px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, background: "#fafbfc" }}>
                    <span>기능</span>{Object.values(ROLES).map(r => <span key={r.label} style={{ textAlign: "center", color: r.color }}>{r.label}</span>)}
                  </div>
                  {Object.entries({ addTask: "업무 추가", editTask: "업무 수정", deleteTask: "업무 삭제", addTeam: "팀 추가", manageUsers: "사용자 관리" }).map(([p, label], i, arr) => (
                    <div key={p} style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(4,1fr)", padding: "9px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#475569" }}>{label}</span>
                      {Object.keys(ROLES).map(role => <span key={role} style={{ textAlign: "center", fontSize: 14 }}>{PERMISSIONS[role][p] ? "✅" : "❌"}</span>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 내 계정 */}
            {tab === "account" && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>내 계정</div>
                <div style={{ background: "#fafbfc", border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px 22px", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <Avatar name={currentUser.name} size={52} color={ROLES[currentUser.role].color} />
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{currentUser.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{currentUser.email}</div>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 10, background: ROLES[currentUser.role].bg, color: ROLES[currentUser.role].color }}>{ROLES[currentUser.role].icon} {ROLES[currentUser.role].label}</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      ["소속 팀", (() => { const t = data.teams.find(t => t.id === currentUser.teamId); return t ? `${t.emoji} ${t.name}` : "전체"; })()],
                      ["가입일", currentUser.joinedAt],
                      ["상태", currentUser.status],
                      ["권한", ROLES[currentUser.role].label],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: "#ffffff", borderRadius: 10, padding: "11px 14px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#fafbfc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 12 }}>🔄 사용자 전환 <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>(데모용)</span></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {data.users.map(u => {
                      const r = ROLES[u.role];
                      const isActive = u.id === currentUser.id;
                      return (
                        <button key={u.id} onClick={() => !isActive && setData(d => ({ ...d, currentUserId: u.id }))} style={{ background: isActive ? "rgba(37,99,235,0.06)" : "transparent", border: isActive ? "1px solid rgba(37,99,235,0.2)" : "1px solid transparent", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, cursor: isActive ? "default" : "pointer", textAlign: "left" }}>
                          <Avatar name={u.name} size={26} color={r.color} />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: isActive ? "#2563eb" : "#475569" }}>{u.name}</span>
                            {isActive && <span style={{ fontSize: 10, color: "#2563eb", marginLeft: 6 }}>현재</span>}
                          </div>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: r.bg, color: r.color }}>{r.icon} {r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 사용자 추가 모달 */}
      {showAdd && (
        <div style={C.overlay} onClick={() => setShowAdd(false)}>
          <div style={C.mbox(450)} onClick={e => e.stopPropagation()}>
            <div style={C.mhead}><h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>새 사용자 추가</h3><button onClick={() => setShowAdd(false)} style={C.xbtn}>✕</button></div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[["이름 *", "text", "name", "홍길동"], ["이메일 *", "email", "email", "user@project.io"]].map(([label, type, field, ph]) => (
                <div key={field}><label style={C.lbl}>{label}</label><input type={type} value={nu[field]} onChange={e => setNu(p => ({ ...p, [field]: e.target.value }))} placeholder={ph} style={C.inp} /></div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={C.lbl}>권한</label><select value={nu.role} onChange={e => setNu(p => ({ ...p, role: e.target.value }))} style={C.inp}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
                <div><label style={C.lbl}>소속 팀</label><select value={nu.teamId} onChange={e => setNu(p => ({ ...p, teamId: e.target.value }))} style={C.inp}><option value="">팀 없음</option>{data.teams.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}</select></div>
              </div>
              <div style={{ background: "#fafbfc", borderRadius: 10, padding: "10px 13px", border: `1px solid ${ROLES[nu.role].color}25` }}>
                <div style={{ fontSize: 11, color: ROLES[nu.role].color, marginBottom: 3 }}>{ROLES[nu.role].icon} {ROLES[nu.role].label}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{ROLES[nu.role].desc}</div>
              </div>
              <button onClick={doAdd} style={C.sbtn(!!(nu.name && nu.email))}>사용자 추가하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 수정 모달 */}
      {editUser && (
        <div style={C.overlay} onClick={() => setEdit(null)}>
          <div style={C.mbox(430)} onClick={e => e.stopPropagation()}>
            <div style={C.mhead}><h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>사용자 정보 수정</h3><button onClick={() => setEdit(null)} style={C.xbtn}>✕</button></div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fafbfc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <Avatar name={editUser.name} size={36} color={ROLES[editUser.role].color} />
                <div><div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{editUser.name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{editUser.email}</div></div>
              </div>
              {[["이름", "text", "name"], ["이메일", "email", "email"]].map(([label, type, field]) => (
                <div key={field}><label style={C.lbl}>{label}</label><input type={type} value={editUser[field]} onChange={e => setEdit(p => ({ ...p, [field]: e.target.value }))} style={C.inp} /></div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={C.lbl}>권한</label><select value={editUser.role} onChange={e => setEdit(p => ({ ...p, role: e.target.value }))} style={{ ...C.inp, color: ROLES[editUser.role].color }}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
                <div><label style={C.lbl}>소속 팀</label><select value={editUser.teamId || ""} onChange={e => setEdit(p => ({ ...p, teamId: e.target.value ? Number(e.target.value) : null }))} style={C.inp}><option value="">팀 없음</option>{data.teams.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}</select></div>
              </div>
              <div><label style={C.lbl}>상태</label><select value={editUser.status} onChange={e => setEdit(p => ({ ...p, status: e.target.value }))} style={C.inp}><option>활성</option><option>비활성</option></select></div>
              <button onClick={doSave} style={C.sbtn(true)}>저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
