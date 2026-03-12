export const ROLES = {
  admin:   { label:"관리자", color:"#1e3a8a", bg:"rgba(30,58,138,0.1)",   icon:"👑", desc:"모든 기능 접근 및 사용자·권한 관리" },
  manager: { label:"매니저", color:"#2563eb", bg:"rgba(37,99,235,0.1)",   icon:"⭐", desc:"업무 생성·수정·삭제, 팀 관리" },
  member:  { label:"멤버",   color:"#0891b2", bg:"rgba(8,145,178,0.1)",   icon:"👤", desc:"업무 조회 및 상태·진행률 수정" },
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
    { id:1, name:"프론트엔드", color:"#2563eb", emoji:"🎨" },
    { id:2, name:"백엔드",     color:"#0891b2", emoji:"⚙️" },
    { id:3, name:"디자인",     color:"#0ea5e9", emoji:"✏️" },
    { id:4, name:"기획",       color:"#1e3a8a", emoji:"📋" },
  ],
  tasks: [
    { id:1,  teamId:1, title:"메인 페이지 리뉴얼",       description:"홈화면 UI/UX 전면 개편 및 반응형 작업",       status:"진행중", priority:"높음", assignee:"김민준", dueDate:"2026-03-25", createdAt:"2026-03-01", tags:["React","CSS"],           progress:65, subtasks:[
      { id:"1-1", title:"와이어프레임 작성",      assignee:"김민준", startDate:"2026-03-01", dueDate:"2026-03-07", status:"완료",   progress:100 },
      { id:"1-2", title:"UI 컴포넌트 개발",       assignee:"이서연", startDate:"2026-03-07", dueDate:"2026-03-18", status:"진행중", progress:70  },
      { id:"1-3", title:"반응형 적용 및 QA",      assignee:"박지호", startDate:"2026-03-18", dueDate:"2026-03-25", status:"대기",   progress:0   },
    ]},
    { id:2,  teamId:1, title:"로그인 플로우 개선",        description:"소셜 로그인 추가 및 2FA 구현",                status:"완료",   priority:"중간", assignee:"이서연", dueDate:"2026-03-10", createdAt:"2026-02-20", tags:["Auth","OAuth"],          progress:100, subtasks:[
      { id:"2-1", title:"소셜 로그인 연동",        assignee:"이서연", startDate:"2026-02-20", dueDate:"2026-03-01", status:"완료",   progress:100 },
      { id:"2-2", title:"2FA 구현",               assignee:"이서연", startDate:"2026-03-01", dueDate:"2026-03-07", status:"완료",   progress:100 },
      { id:"2-3", title:"테스트 및 배포",          assignee:"김민준", startDate:"2026-03-07", dueDate:"2026-03-10", status:"완료",   progress:100 },
    ]},
    { id:3,  teamId:1, title:"성능 최적화",               description:"번들 사이즈 감소 및 Lazy Loading 적용",       status:"대기",   priority:"낮음", assignee:"박지호", dueDate:"2026-04-05", createdAt:"2026-03-05", tags:["Performance"],           progress:0, subtasks:[
      { id:"3-1", title:"번들 사이즈 분석",        assignee:"박지호", startDate:"2026-03-05", dueDate:"2026-03-15", status:"대기",   progress:0   },
      { id:"3-2", title:"Lazy Loading 적용",       assignee:"박지호", startDate:"2026-03-15", dueDate:"2026-03-28", status:"대기",   progress:0   },
      { id:"3-3", title:"성능 테스트",             assignee:"김민준", startDate:"2026-03-28", dueDate:"2026-04-05", status:"대기",   progress:0   },
    ]},
    { id:4,  teamId:2, title:"API 게이트웨이 구축",       description:"MSA 전환을 위한 API 게이트웨이 설계 및 구현", status:"진행중", priority:"높음", assignee:"최동현", dueDate:"2026-03-30", createdAt:"2026-02-15", tags:["Node.js","MSA"],         progress:40, subtasks:[
      { id:"4-1", title:"아키텍처 설계",           assignee:"최동현", startDate:"2026-02-15", dueDate:"2026-02-28", status:"완료",   progress:100 },
      { id:"4-2", title:"라우팅 구현",             assignee:"정수빈", startDate:"2026-02-28", dueDate:"2026-03-15", status:"진행중", progress:45  },
      { id:"4-3", title:"인증 미들웨어 개발",      assignee:"최동현", startDate:"2026-03-15", dueDate:"2026-03-30", status:"대기",   progress:0   },
    ]},
    { id:5,  teamId:2, title:"데이터베이스 마이그레이션", description:"MySQL → PostgreSQL 마이그레이션 계획 수립",    status:"대기",   priority:"높음", assignee:"정수빈", dueDate:"2026-04-15", createdAt:"2026-03-08", tags:["DB","Migration"],        progress:10, subtasks:[
      { id:"5-1", title:"마이그레이션 계획 수립",  assignee:"정수빈", startDate:"2026-03-08", dueDate:"2026-03-20", status:"진행중", progress:30  },
      { id:"5-2", title:"데이터 변환 스크립트",    assignee:"최동현", startDate:"2026-03-20", dueDate:"2026-04-05", status:"대기",   progress:0   },
      { id:"5-3", title:"스테이징 환경 테스트",    assignee:"정수빈", startDate:"2026-04-05", dueDate:"2026-04-15", status:"대기",   progress:0   },
    ]},
    { id:6,  teamId:2, title:"보안 취약점 패치",          description:"정기 보안 점검 및 취약점 수정",               status:"완료",   priority:"높음", assignee:"한태양", dueDate:"2026-03-05", createdAt:"2026-02-28", tags:["Security"],              progress:100, subtasks:[
      { id:"6-1", title:"취약점 스캔",             assignee:"한태양", startDate:"2026-02-28", dueDate:"2026-03-02", status:"완료",   progress:100 },
      { id:"6-2", title:"패치 적용",               assignee:"한태양", startDate:"2026-03-02", dueDate:"2026-03-04", status:"완료",   progress:100 },
      { id:"6-3", title:"검증 및 배포",            assignee:"최동현", startDate:"2026-03-04", dueDate:"2026-03-05", status:"완료",   progress:100 },
    ]},
    { id:7,  teamId:3, title:"디자인 시스템 구축",        description:"컴포넌트 라이브러리 및 가이드라인 문서화",     status:"진행중", priority:"중간", assignee:"윤하늘", dueDate:"2026-04-01", createdAt:"2026-02-10", tags:["Figma","Design System"], progress:55, subtasks:[
      { id:"7-1", title:"컬러·타이포그래피 정의",  assignee:"윤하늘", startDate:"2026-02-10", dueDate:"2026-02-25", status:"완료",   progress:100 },
      { id:"7-2", title:"컴포넌트 라이브러리 제작",assignee:"윤하늘", startDate:"2026-02-25", dueDate:"2026-03-20", status:"진행중", progress:60  },
      { id:"7-3", title:"가이드라인 문서화",        assignee:"임채원", startDate:"2026-03-20", dueDate:"2026-04-01", status:"대기",   progress:0   },
    ]},
    { id:8,  teamId:3, title:"앱 아이콘 리뉴얼",          description:"브랜드 아이덴티티에 맞는 앱 아이콘 재디자인", status:"완료",   priority:"낮음", assignee:"임채원", dueDate:"2026-03-01", createdAt:"2026-02-01", tags:["Branding"],              progress:100, subtasks:[
      { id:"8-1", title:"컨셉 기획",               assignee:"임채원", startDate:"2026-02-01", dueDate:"2026-02-10", status:"완료",   progress:100 },
      { id:"8-2", title:"시안 제작",               assignee:"임채원", startDate:"2026-02-10", dueDate:"2026-02-22", status:"완료",   progress:100 },
      { id:"8-3", title:"최종 납품",               assignee:"윤하늘", startDate:"2026-02-22", dueDate:"2026-03-01", status:"완료",   progress:100 },
    ]},
    { id:9,  teamId:4, title:"Q2 로드맵 수립",            description:"2분기 제품 로드맵 기획 및 이해관계자 공유",   status:"진행중", priority:"높음", assignee:"강민서", dueDate:"2026-03-20", createdAt:"2026-03-01", tags:["Planning"],              progress:80, subtasks:[
      { id:"9-1", title:"현황 분석",               assignee:"강민서", startDate:"2026-03-01", dueDate:"2026-03-08", status:"완료",   progress:100 },
      { id:"9-2", title:"로드맵 초안 작성",         assignee:"강민서", startDate:"2026-03-08", dueDate:"2026-03-15", status:"완료",   progress:100 },
      { id:"9-3", title:"이해관계자 리뷰",          assignee:"오지우", startDate:"2026-03-15", dueDate:"2026-03-20", status:"진행중", progress:40  },
    ]},
    { id:10, teamId:4, title:"사용자 리서치",             description:"신규 기능에 대한 사용자 인터뷰 및 설문 조사", status:"대기",   priority:"중간", assignee:"오지우", dueDate:"2026-04-10", createdAt:"2026-03-10", tags:["Research","UX"],         progress:0, subtasks:[
      { id:"10-1", title:"인터뷰 대상 선정",        assignee:"오지우", startDate:"2026-03-10", dueDate:"2026-03-17", status:"대기",   progress:0   },
      { id:"10-2", title:"인터뷰 진행",             assignee:"오지우", startDate:"2026-03-17", dueDate:"2026-04-01", status:"대기",   progress:0   },
      { id:"10-3", title:"결과 분석 및 보고",       assignee:"강민서", startDate:"2026-04-01", dueDate:"2026-04-10", status:"대기",   progress:0   },
    ]},
  ],
};

export const statusConfig = {
  "전체":  { color:"#64748b", bg:"rgba(100,116,139,0.08)" },
  "대기":  { color:"#64748b", bg:"rgba(100,116,139,0.08)" },
  "진행중":{ color:"#2563eb", bg:"rgba(37,99,235,0.1)"    },
  "완료":  { color:"#0891b2", bg:"rgba(8,145,178,0.1)"    },
};

export const priorityConfig = {
  "높음":{ color:"#1e3a8a", label:"🔵" },
  "중간":{ color:"#2563eb", label:"🔹" },
  "낮음":{ color:"#0ea5e9", label:"💠" },
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
    background: ok ? "linear-gradient(135deg,#1e3a8a,#2563eb)" : "#f1f5f9",
    border:"none", borderRadius:10, padding:"11px 0",
    color: ok ? "#fff" : "#94a3b8", fontSize:13, fontWeight:600,
    cursor: ok ? "pointer" : "default", width:"100%",
  }),
};
