import { useState } from "react";
import { initialData, PERMISSIONS } from "./constants";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TaskList from "./components/TaskList";
import TaskDetail from "./components/TaskDetail";
import AddTaskModal from "./components/AddTaskModal";
import AddTeamModal from "./components/AddTeamModal";
import SettingsPage from "./components/SettingsPage";

export default function App() {
  const [data, setData]             = useState(initialData);
  const [selTeam, setSelTeam]       = useState("전체");
  const [stFilter, setStFilter]     = useState("전체");
  const [selTask, setSelTask]        = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch]         = useState("");

  const currentUser = data.users.find(u => u.id === data.currentUserId) || data.users[0];
  const perms = PERMISSIONS[currentUser.role];

  const filtered = data.tasks.filter(t =>
    (selTeam === "전체" || t.teamId === selTeam) &&
    (stFilter === "전체" || t.status === stFilter) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee.toLowerCase().includes(search.toLowerCase()))
  );

  const getStats = (tid) => {
    const ts = tid === "전체" ? data.tasks : data.tasks.filter(t => t.teamId === tid);
    return {
      total: ts.length,
      done: ts.filter(t => t.status === "완료").length,
      inProgress: ts.filter(t => t.status === "진행중").length,
      waiting: ts.filter(t => t.status === "대기").length,
    };
  };

  const doAddTask = (task) => {
    setData(d => ({ ...d, tasks: [...d.tasks, task] }));
  };

  const doAddTeam = (team) => {
    setData(d => ({ ...d, teams: [...d.teams, team] }));
  };

  const doUpdateStatus = (tid, status) => {
    if (!perms.editTask) return;
    const progress = status === "완료" ? 100 : status === "대기" ? 0 : undefined;
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === tid ? { ...t, status, ...(progress !== undefined ? { progress } : {}) } : t) }));
    setSelTask(prev => prev ? { ...prev, status, ...(progress !== undefined ? { progress } : {}) } : null);
  };

  const doUpdateProgress = (tid, progress) => {
    if (!perms.editTask) return;
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === tid ? { ...t, progress: Number(progress) } : t) }));
    setSelTask(prev => prev ? { ...prev, progress: Number(progress) } : null);
  };

  const doDeleteTask = (tid) => {
    if (!perms.deleteTask) return;
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== tid) }));
    setSelTask(null);
  };

  // Sync selTask with latest data
  const liveTask = selTask ? data.tasks.find(t => t.id === selTask.id) || selTask : null;

  return (
    <div style={{ fontFamily: "'Noto Sans KR',sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b", display: "flex", flexDirection: "column" }}>
      <Header
        currentUser={currentUser}
        search={search}
        setSearch={setSearch}
        onSettings={() => setShowSettings(true)}
        onAddTask={() => setShowAddTask(true)}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 56px)" }}>
        <Sidebar
          data={data}
          setData={setData}
          currentUser={currentUser}
          selTeam={selTeam}
          setSelTeam={setSelTeam}
          stFilter={stFilter}
          setStFilter={setStFilter}
          onAddTeam={() => setShowAddTeam(true)}
        />

        <TaskList
          tasks={filtered}
          teams={data.teams}
          stats={getStats(selTeam)}
          onSelectTask={setSelTask}
        />
      </div>

      {showSettings && (
        <SettingsPage
          data={data}
          setData={setData}
          currentUser={currentUser}
          onClose={() => setShowSettings(false)}
        />
      )}

      {liveTask && (
        <TaskDetail
          task={liveTask}
          teams={data.teams}
          currentUser={currentUser}
          onClose={() => setSelTask(null)}
          onUpdateStatus={doUpdateStatus}
          onUpdateProgress={doUpdateProgress}
          onDelete={doDeleteTask}
        />
      )}

      {showAddTask && perms.addTask && (
        <AddTaskModal
          teams={data.teams}
          onAdd={doAddTask}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {showAddTeam && perms.addTeam && (
        <AddTeamModal
          onAdd={doAddTeam}
          onClose={() => setShowAddTeam(false)}
        />
      )}
    </div>
  );
}
