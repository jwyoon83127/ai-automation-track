export const ROLES = {
  admin:   { label:"관리자", color:"#dc2626", bg:"rgba(220,38,38,0.1)",   icon:"👑", desc:"모든 기능 접근 및 사용자·권한 관리" },
  manager: { label:"매니저", color:"#d97706", bg:"rgba(217,119,6,0.1)",   icon:"⭐", desc:"업무 생성·수정·삭제, 팀 관리" },
  member:  { label:"멤버",   color:"#4f46e5", bg:"rgba(79,70,229,0.1)",   icon:"👤", desc:"업무 조회 및 상태·진행률 수정" },
  viewer:  { label:"뷰어",   color:"#64748b", bg:"rgba(100,116,139,0.1)", icon:"👁", desc:"업무 조회만 가능" },
};

export const PERMISSIONS = {
  admin:   { addTask:true,  editTask:true,  deleteTask:true,  addTeam:true,  manageUsers:true  },
  manager: { addTask:true,  editTask:true,  deleteTask:true,  addTeam:true,  manageUsers:false },
  member:  { addTask:false, editTask:true,  deleteTask:false, addTeam:false, manageUsers:false },
  viewer:  { addTask:false, editTask:false, deleteTask:false, addTeam:false, manageUsers:false },
};

export const initialData = {
  currentUserId: 1,
  users: [
    { id:1,  name:"김관리자", email:"admin@project.io",    role:"admin",   teamId:null, joinedAt:"2026-01-01", status:"활성" },
    { id:2,  name:"이매니저", email:"manager@project.io",  role:"manager", teamId:1,    joinedAt:"2026-01-10", status:"활성" },
    { id:3,  name:"김민준",   email:"minjun@project.io",   role:"member",  teamId:1,    joinedAt:"2026-01-15", status:"활성" },
    { id:4,  name:"이서연",   email:"seoyeon@project.io",  role:"member",  teamId:1,    joinedAt:"2026-01-20", status:"활성" },
    { id:5,  name:"박지호",   email:"jiho@project.io",     role:"member",  teamId:1,    joinedAt:"2026-02-01", status:"활성" },
    { id:6,  name:"최동현",   email:"donghyun@project.io", role:"manager", teamId:2,    joinedAt:"2026-01-10", status:"활성" },
    { id:7,  name:"정수빈",   email:"subin@project.io",    role:"member",  teamId:2,    joinedAt:"2026-02-05", status:"활성" },
    { id:8,  name:"한태양",   email:"taeyang@project.io",  role:"member",  teamId:2,    joinedAt:"2026-02-10", status:"비활성" },
    { id:9,  name:"윤하늘",   email:"haneul@project.io",   role:"member",  teamId:3,    joinedAt:"2026-01-25", status:"활성" },
    { id:10, name:"강민서",   email:"minseo@project.io",   role:"viewer",  teamId:4,    joinedAt:"2026-03-01", status:"활성" },
  ],
  teams: [
    { id:1, name:"프론트엔드", color:"#4f46e5", emoji:"🎨" },
    { id:2, name:"백엔드",     color:"#059669", emoji:"⚙️" },
    { id:3, name:"디자인",     color:"#d97706", emoji:"✏️" },
    { id:4, name:"기획",       color:"#dc2626", emoji:"📋" },
  ],
  tasks: [
    { id:1,  teamId:1, title:"메인 페이지 리뉴얼",       description:"홈화면 UI/UX 전면 개편 및 반응형 작업",       status:"진행중", priority:"높음", assignee:"김민준", dueDate:"2026-03-25", createdAt:"2026-03-01", tags:["React","CSS"],           progress:65  },
    { id:2,  teamId:1, title:"로그인 플로우 개선",        description:"소셜 로그인 추가 및 2FA 구현",                status:"완료",   priority:"중간", assignee:"이서연", dueDate:"2026-03-10", createdAt:"2026-02-20", tags:["Auth","OAuth"],          progress:100 },
    { id:3,  teamId:1, title:"성능 최적화",               description:"번들 사이즈 감소 및 Lazy Loading 적용",       status:"대기",   priority:"낮음", assignee:"박지호", dueDate:"2026-04-05", createdAt:"2026-03-05", tags:["Performance"],           progress:0   },
    { id:4,  teamId:2, title:"API 게이트웨이 구축",       description:"MSA 전환을 위한 API 게이트웨이 설계 및 구현", status:"진행중", priority:"높음", assignee:"최동현", dueDate:"2026-03-30", createdAt:"2026-02-15", tags:["Node.js","MSA"],         progress:40  },
    { id:5,  teamId:2, title:"데이터베이스 마이그레이션", description:"MySQL → PostgreSQL 마이그레이션 계획 수립",    status:"대기",   priority:"높음", assignee:"정수빈", dueDate:"2026-04-15", createdAt:"2026-03-08", tags:["DB","Migration"],        progress:10  },
    { id:6,  teamId:2, title:"보안 취약점 패치",          description:"정기 보안 점검 및 취약점 수정",               status:"완료",   priority:"높음", assignee:"한태양", dueDate:"2026-03-05", createdAt:"2026-02-28", tags:["Security"],              progress:100 },
    { id:7,  teamId:3, title:"디자인 시스템 구축",        description:"컴포넌트 라이브러리 및 가이드라인 문서화",     status:"진행중", priority:"중간", assignee:"윤하늘", dueDate:"2026-04-01", createdAt:"2026-02-10", tags:["Figma","Design System"], progress:55  },
    { id:8,  teamId:3, title:"앱 아이콘 리뉴얼",          description:"브랜드 아이덴티티에 맞는 앱 아이콘 재디자인", status:"완료",   priority:"낮음", assignee:"임채원", dueDate:"2026-03-01", createdAt:"2026-02-01", tags:["Branding"],              progress:100 },
    { id:9,  teamId:4, title:"Q2 로드맵 수립",            description:"2분기 제품 로드맵 기획 및 이해관계자 공유",   status:"진행중", priority:"높음", assignee:"강민서", dueDate:"2026-03-20", createdAt:"2026-03-01", tags:["Planning"],              progress:80  },
    { id:10, teamId:4, title:"사용자 리서치",             description:"신규 기능에 대한 사용자 인터뷰 및 설문 조사", status:"대기",   priority:"중간", assignee:"오지우", dueDate:"2026-04-10", createdAt:"2026-03-10", tags:["Research","UX"],         progress:0   },
  ],
};

export const statusConfig = {
  "전체":  { color:"#64748b", bg:"rgba(100,116,139,0.08)" },
  "대기":  { color:"#64748b", bg:"rgba(100,116,139,0.08)" },
  "진행중":{ color:"#4f46e5", bg:"rgba(79,70,229,0.1)"    },
  "완료":  { color:"#059669", bg:"rgba(5,150,105,0.1)"    },
};

export const priorityConfig = {
  "높음":{ color:"#dc2626", label:"🔴" },
  "중간":{ color:"#d97706", label:"🟡" },
  "낮음":{ color:"#059669", label:"🟢" },
};

export const C = {
  bg:     "#f1f5f9",
  card:   "#ffffff",
  border: "#e2e8f0",
  text:   "#1e293b",
  sub:    "#475569",
  muted:  "#94a3b8",
  inp: {
    width:"100%", background:"#ffffff", border:"1px solid #e2e8f0",
    borderRadius:8, padding:"9px 12px", color:"#1e293b",
    fontSize:13, outline:"none", fontFamily:"inherit",
  },
  lbl: { fontSize:11, color:"#64748b", display:"block", marginBottom:5 },
  overlay: {
    position:"fixed", inset:0, background:"rgba(15,23,42,0.4)",
    zIndex:200, display:"flex", alignItems:"center",
    justifyContent:"center", padding:16, backdropFilter:"blur(4px)",
  },
  mbox: (mw=520) => ({
    background:"#ffffff", border:"1px solid #e2e8f0",
    borderRadius:20, width:"100%", maxWidth:mw, maxHeight:"90vh", overflow:"auto",
    boxShadow:"0 20px 60px rgba(15,23,42,0.15)",
  }),
  mhead: {
    padding:"18px 22px", borderBottom:"1px solid #f1f5f9",
    display:"flex", justifyContent:"space-between", alignItems:"center",
  },
  xbtn: { background:"transparent", border:"none", color:"#94a3b8", fontSize:18, cursor:"pointer" },
  sbtn: (ok) => ({
    background: ok ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#f1f5f9",
    border:"none", borderRadius:10, padding:"11px 0",
    color: ok ? "#fff" : "#94a3b8", fontSize:13, fontWeight:600,
    cursor: ok ? "pointer" : "default", width:"100%",
  }),
};
